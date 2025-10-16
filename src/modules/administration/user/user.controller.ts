import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query, Patch } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateExpoPushTokenDto } from './dto/update-expo-push-token.dto';
import { UserFilterDto } from './dto/filter-user.dto';
import { UserResponseArrDto, UserResponseObjDto } from './dto/response-user.dto';
import { ResponseDto, ResponseStatus } from '@/common/dtos/response.dto';
import {
    UserControllerDocs,
    FindAllUsersDocs,
    FindOneUserDocs,
    CreateUserDocs,
    UpdateUserDocs,
    DeleteUserDocs,
    UpdateExpoPushTokenDocs,
} from './docs/user.docs';

@UseGuards(AuthGuard)
@UserControllerDocs
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @CreateUserDocs
    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseObjDto> {
        const data = await this.userService.create(createUserDto);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Usuario creado exitosamente',
            data,
        };
    }

    @FindAllUsersDocs
    @Get()
    async findAll(@Query() filters: UserFilterDto): Promise<UserResponseArrDto> {
        const { data, metadata } = await this.userService.findAll(filters);
        return { status: ResponseStatus.SUCCESS, message: 'Lista de usuarios obtenida correctamente', data, metadata };
    }

    @FindOneUserDocs
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserResponseObjDto> {
        const data = await this.userService.findOne(+id);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Usuario obtenido correctamente',
            data,
        };
    }

    @UpdateUserDocs
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseObjDto> {
        const data = await this.userService.update(+id, updateUserDto);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Usuario actualizado exitosamente',
            data,
        };
    }

    @DeleteUserDocs
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<ResponseDto> {
        await this.userService.remove(+id);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Usuario bloqueado exitosamente',
        };
    }

    @UpdateExpoPushTokenDocs
    @Patch(':userId/expo-push-token')
    async validateAndUpdateExpoPushToken(
        @Param('userId') userId: string,
        @Body() updateExpoPushTokenDto: UpdateExpoPushTokenDto
    ): Promise<ResponseDto> {
        await this.userService.validateAndUpdateExpoPushToken(+userId, updateExpoPushTokenDto.expoPushToken);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Token validado y actualizado exitosamente',
        };
    }
}
