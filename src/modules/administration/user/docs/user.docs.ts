import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiOkResponse,
    ApiParam,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiCookieAuth,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateExpoPushTokenDto } from '../dto/update-expo-push-token.dto';
import { UserResponseArrDto, UserResponseObjDto } from '../dto/response-user.dto';
import { ResponseDto, ResponseStatus } from '@/common/dtos/response.dto';
import { ErrorAuthResponseDto } from '@/modules/auth/dto/response-auth.dto';

export const UserControllerDocs = applyDecorators(
    ApiTags('Usuarios'),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({
        description: 'Error de autenticación. Por favor inicia sesión.',
        type: ErrorAuthResponseDto,
        example: {
            status: ResponseStatus.ERROR,
            message: 'Error de autenticación. Por favor inicia sesión.',
            code: 'AUTH_ERROR',
        },
    })
);

export const CreateUserDocs = applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo usuario', description: 'Registra un nuevo usuario en el sistema.' }),
    ApiBody({ type: CreateUserDto, description: 'Datos para registrar un nuevo usuario' }),
    ApiCreatedResponse({ description: 'Usuario creado exitosamente', type: UserResponseObjDto })
);

export const FindAllUsersDocs = applyDecorators(
    ApiOperation({
        summary: 'Obtener usuarios con filtros, búsqueda y paginación',
        description:
            'Devuelve una lista de usuarios con soporte para filtros, búsqueda general, ordenamiento y paginación. Si no se especifican parámetros de paginación, devuelve todos los registros.',
    }),
    ApiQuery({
        name: 'page',
        required: false,
        description: 'Número de página (empezando desde 1)',
        example: 1,
    }),
    ApiQuery({
        name: 'limit',
        required: false,
        description: 'Número de elementos por página',
        example: 10,
    }),
    ApiQuery({
        name: 'sortOrder',
        required: false,
        description: 'Orden de clasificación',
        example: 'asc',
        enum: ['asc', 'desc'],
    }),
    ApiQuery({
        name: 'search',
        required: false,
        description: 'Término de búsqueda general (busca en username, email, nombre y apellido)',
        example: 'john',
    }),
    ApiQuery({
        name: 'sortBy',
        required: false,
        description: 'Campo por el cual ordenar',
        example: 'username',
        enum: ['userId', 'username', 'email', 'firstName', 'lastName'],
    }),
    ApiQuery({
        name: 'roleId',
        required: false,
        description: 'Filtrar usuarios por ID de rol',
        example: 1,
        type: Number,
    }),
    ApiQuery({
        name: 'yardId',
        required: false,
        description: 'Filtrar usuarios por ID de patio',
        example: 1,
        type: Number,
    }),
    ApiOkResponse({
        description: 'Lista de usuarios con metadatos de paginación',
        type: UserResponseArrDto,
    })
);

export const FindOneUserDocs = applyDecorators(
    ApiOperation({
        summary: 'Obtener un usuario por ID',
        description: 'Devuelve los detalles de un usuario específico por su ID.',
    }),
    ApiParam({ name: 'userId', description: 'ID del usuario' }),
    ApiOkResponse({ description: 'Detalles del usuario', type: UserResponseObjDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Usuario no encontrado' }),
    ApiBadRequestResponse({ description: 'ID inválido', type: ResponseDto })
);

export const UpdateUserDocs = applyDecorators(
    ApiOperation({
        summary: 'Actualizar un usuario',
        description: 'Actualiza los datos de un usuario existente por su ID.',
    }),
    ApiParam({ name: 'userId', description: 'ID del usuario' }),
    ApiBody({ type: UpdateUserDto, description: 'Datos para actualizar un usuario existente' }),
    ApiOkResponse({ description: 'Usuario actualizado exitosamente', type: UserResponseObjDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Usuario no encontrado' })
);

export const DeleteUserDocs = applyDecorators(
    ApiOperation({
        summary: 'Eliminar (bloquear) un usuario',
        description: 'Bloquea un usuario específico por su ID (borrado lógico).',
    }),
    ApiParam({ name: 'userId', description: 'ID del usuario' }),
    ApiOkResponse({ description: 'Usuario bloqueado exitosamente', type: ResponseDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Usuario no encontrado' })
);

export const UpdateExpoPushTokenDocs = applyDecorators(
    ApiOperation({
        summary: 'Validar y actualizar token de notificaciones push',
        description:
            'Valida y actualiza el token de Expo Push Notifications de manera inteligente: Si el usuario no tiene token o es diferente, lo actualiza. Si es el mismo, no hace nada.',
    }),
    ApiParam({ name: 'userId', description: 'ID del usuario' }),
    ApiBody({ type: UpdateExpoPushTokenDto, description: 'Token de notificaciones push de Expo' }),
    ApiOkResponse({ description: 'Token validado y actualizado exitosamente', type: ResponseDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Usuario no encontrado' }),
    ApiBadRequestResponse({ type: ResponseDto, description: 'Token inválido' })
);
