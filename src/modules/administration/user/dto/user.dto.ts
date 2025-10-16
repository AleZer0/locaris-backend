import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralStatus, UserRole } from 'generated/prisma';
import { StorageSimple } from '@/modules/configuration/storage/dto/storage.dto';

export class UserDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiPropertyOptional({
        type: () => UserRole,
        description: 'Información del rol del usuario con sus permisos',
    })
    role?: UserRole | null;

    @ApiPropertyOptional({ example: 'j.perez' })
    username: string | null;

    @ApiProperty({ example: 'juan@example.com' })
    email: string;

    @ApiPropertyOptional({ example: 'Juan' })
    firstName: string | null;

    @ApiPropertyOptional({
        example: 'juan',
        description: 'Nombre normalizado para búsquedas optimizadas',
    })
    firstNameNormalized: string | null;

    @ApiPropertyOptional({ example: 'Perez' })
    lastName: string | null;

    @ApiPropertyOptional({
        example: 'perez',
        description: 'Apellido normalizado para búsquedas optimizadas',
    })
    lastNameNormalized: string | null;

    @ApiPropertyOptional({ example: '+525551234567' })
    phone: string | null;

    @ApiProperty({
        example: GeneralStatus.active,
        description: 'Estado del usuario',
        enum: GeneralStatus,
    })
    status: GeneralStatus;

    @ApiPropertyOptional({ example: '2025-06-21T12:00:00.000Z' })
    createdAt: Date | null;

    @ApiPropertyOptional({ example: '2025-06-21T12:00:00.000Z' })
    updatedAt: Date | null;

    @ApiPropertyOptional({ example: null })
    deletedAt: Date | null;

    @ApiPropertyOptional({
        description: 'Imagen del usuario (avatar)',
    })
    image: StorageSimple | null;

    @ApiPropertyOptional({ example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
    expoPushToken: string | null;
}

export class SimpleUserDto {
    @ApiProperty({ example: 1 })
    userId: number;

    @ApiPropertyOptional({ example: 'Alexis' })
    firstName: string | null;

    @ApiPropertyOptional({ example: 'García' })
    lastName: string | null;
}
