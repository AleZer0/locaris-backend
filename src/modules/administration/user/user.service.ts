import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/filter-user.dto';
import { GeneralStatus, Prisma } from 'generated/prisma';
import { PaginationHelper } from '@/common/utils/pagination.helper';
import { compare, hash } from 'bcryptjs';
import { UserDto } from './dto/user.dto';
import { removeProp } from '@/common/utils/removeProp';
import { SimpleStorageService } from '@/modules/configuration/storage/storage.service';
import { ResponseStatus } from '@/common/dtos/response.dto';
import { normalizeToLowercase } from '@/common/utils/text-normalization.helper';
import { USER_INCLUDE } from '@/common/constants/prisma-includes';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly vehicleStorageService: SimpleStorageService
    ) {}

    private readonly include = USER_INCLUDE;

    async create(data: CreateUserDto): Promise<UserDto> {
        const existEmail = await this.findByEmailOrUsername(data.email);
        if (existEmail) {
            throw new BadRequestException({ status: ResponseStatus.ERROR, message: 'El usuario ya existe' });
        }

        const existUsername = await this.findByEmailOrUsername(data.username);
        if (existUsername) {
            throw new BadRequestException({ status: ResponseStatus.ERROR, message: 'El nombre de usuario ya existe' });
        }

        const hashedPassword = await hash(data.password, 10);

        const created = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                ...(data.firstName && { firstNameNormalized: normalizeToLowercase(data.firstName) }),
                ...(data.lastName && { lastNameNormalized: normalizeToLowercase(data.lastName) }),
            },
        });

        return this.transformUser(created);
    }

    async findAll(filters: UserFilterDto) {
        const allowedSortFields = ['id', 'username', 'email', 'firstName', 'lastName'];
        const sortBy = PaginationHelper.validateSortField(filters.sortBy || 'id', allowedSortFields);
        const sortOrder = (filters.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

        const where: any = { status: GeneralStatus.active, deletedAt: null };

        if (filters.search) {
            where.OR = [
                { username: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { firstNameNormalized: { contains: normalizeToLowercase(filters.search), mode: 'insensitive' } },
                { lastNameNormalized: { contains: normalizeToLowercase(filters.search), mode: 'insensitive' } },
            ];
        }

        // Solo paginar si se especifican parámetros de paginación
        const shouldPaginate = filters.page !== undefined || filters.limit !== undefined;
        const skip = shouldPaginate ? PaginationHelper.getSkipCount(filters.page ?? 1, filters.limit ?? 50) : undefined;
        const take = shouldPaginate ? (filters.limit ?? 50) : undefined;

        const [rawData, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                ...(skip !== undefined && { skip }),
                ...(take !== undefined && { take }),
                orderBy: [{ [sortBy]: sortOrder }, { userId: 'asc' }],
                include: this.include,
            }),
            this.prisma.user.count({ where }),
        ]);

        // Transformar usuarios con imágenes
        const transformedData = await Promise.all(rawData.map(user => this.transformUser(user)));

        const metadata = PaginationHelper.createMetadata(filters, total);
        return { data: transformedData, metadata };
    }

    async findOne(id: number): Promise<UserDto> {
        const user = await this.prisma.user.findFirst({
            where: { id, status: GeneralStatus.active, deletedAt: null },
            include: this.include,
        });

        if (!user) throw new NotFoundException({ status: ResponseStatus.ERROR, message: 'Usuario no encontrado' });

        return this.transformUser(user);
    }

    async update(id: number, data: UpdateUserDto): Promise<UserDto> {
        await this.findOne(id);

        if (data.email) {
            const existEmail = await this.findByEmailOrUsername(data.email);
            if (existEmail && existEmail.id !== id) {
                throw new BadRequestException({ status: ResponseStatus.ERROR, message: 'El email ya está en uso' });
            }
        }

        if (data.username) {
            const existUsername = await this.findByEmailOrUsername(data.username);
            if (existUsername && existUsername.id !== id) {
                throw new BadRequestException({
                    status: ResponseStatus.ERROR,
                    message: 'El nombre de usuario ya está en uso',
                });
            }
        }

        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...data,
                ...(data.firstName && { firstNameNormalized: normalizeToLowercase(data.firstName) }),
                ...(data.lastName && { lastNameNormalized: normalizeToLowercase(data.lastName) }),
            },
        });

        return this.transformUser(user);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: { status: GeneralStatus.inactive, deletedAt: new Date() },
        });
    }

    async findByEmailOrUsername(emailOrUsername: string) {
        return this.prisma.user.findFirst({
            where: {
                status: GeneralStatus.active,
                deletedAt: null,
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
        });
    }

    async updatePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.prisma.user.findFirst({
            where: { id, status: GeneralStatus.active, deletedAt: null },
        });

        if (!user) throw new NotFoundException('Usuario no encontrado');

        const isCurrentPasswordValid = await compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('La contraseña actual es incorrecta');
        }

        const isSamePassword = await compare(newPassword, user.password);
        if (isSamePassword) {
            throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
        }

        const hashedPassword = await hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }

    /**
     * Obtener todos los Expo Push Tokens de usuarios activos
     */
    async getAllExpoPushTokens(): Promise<string[]> {
        const users = await this.prisma.user.findMany({
            where: {
                status: GeneralStatus.active,
                deletedAt: null,
                expoPushToken: {
                    not: null,
                },
            },
            select: {
                expoPushToken: true,
            },
        });

        return users.map(user => user.expoPushToken).filter((token): token is string => token !== null);
    }

    /**
     * Buscar usuario por nombre completo (usando normalización).
     */
    async findByFullName(firstName: string, lastName: string): Promise<UserDto | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                firstNameNormalized: normalizeToLowercase(firstName),
                lastNameNormalized: normalizeToLowercase(lastName),
                status: GeneralStatus.active,
                deletedAt: null,
            },
            include: this.include,
        });

        if (!user) return null;

        return this.transformUser(user);
    }

    /**
     * Buscar usuarios por nombre (usando normalización).
     */
    async findByFirstName(firstName: string): Promise<UserDto[]> {
        const users = await this.prisma.user.findMany({
            where: {
                firstNameNormalized: normalizeToLowercase(firstName),
                status: GeneralStatus.active,
                deletedAt: null,
            },
            include: this.include,
        });

        return Promise.all(users.map(user => this.transformUser(user)));
    }

    /**
     * Buscar usuarios por apellido (usando normalización).
     */
    async findByLastName(lastName: string): Promise<UserDto[]> {
        const users = await this.prisma.user.findMany({
            where: {
                lastNameNormalized: normalizeToLowercase(lastName),
                status: GeneralStatus.active,
                deletedAt: null,
            },
            include: this.include,
        });

        return Promise.all(users.map(user => this.transformUser(user)));
    }

    /**
     * Validar y actualizar el Expo Push Token del usuario de manera inteligente:
     * - Si el usuario no tiene token, lo actualiza
     * - Si el usuario tiene un token diferente, lo actualiza
     * - Si el usuario tiene el mismo token, no hace nada
     */
    async validateAndUpdateExpoPushToken(id: number, expoPushToken: string): Promise<void> {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                status: GeneralStatus.active,
                deletedAt: null,
            },
            select: {
                id: true,
                expoPushToken: true,
            },
        });

        // Si no tiene token o es diferente, actualizar
        if (!user!.expoPushToken || user!.expoPushToken !== expoPushToken) {
            await this.prisma.user.update({
                where: { id },
                data: { expoPushToken },
            });
        }
        // Si tiene el mismo token, no hacer nada
    }

    /**
     * Transforma un usuario agregando las imágenes desde storage
     */
    async transformUser(user: Prisma.UserGetPayload<{ include: typeof USER_INCLUDE }>): Promise<UserDto> {
        // Obtener imágenes del usuario desde storage
        const image = await this.vehicleStorageService.findByReferenceId(user.userId);

        // Eliminar la contraseña del usuario
        const userWithoutPassword = removeProp(user, 'password') as any;
        const userWithoutExpoPushToken = removeProp(userWithoutPassword, 'expoPushToken') as any;

        // Construir el usuario transformado
        const transformedUser: UserDto = {
            ...userWithoutExpoPushToken,
            image,
        };

        // Transformar el rol si existe
        if (userWithoutPassword.role) {
            transformedUser.role = this.roleService.transformRole(userWithoutPassword.role);
        }

        return transformedUser;
    }
}
