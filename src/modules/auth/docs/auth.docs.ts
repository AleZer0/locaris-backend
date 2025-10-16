import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiBody,
    ApiCookieAuth,
    ApiParam,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthLoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { ResponseDto, ResponseStatus } from '@/common/dtos/response.dto';
import {
    AuthOkCode,
    OkAuthResponseDto,
    AuthErrorCode,
    ErrorAuthResponseDto,
    ProfileResponseDto,
} from '../dto/response-auth.dto';

export const LoginDocs = applyDecorators(
    ApiOperation({ summary: 'Iniciar sesión y obtener tokens' }),
    ApiBody({ type: AuthLoginDto }),
    ApiOkResponse({
        description: 'Login exitoso, tokens en cookies',
        type: OkAuthResponseDto,
        example: { status: ResponseStatus.SUCCESS, message: 'Sesión iniciada', code: AuthOkCode.LOGIN },
    }),
    ApiUnauthorizedResponse({
        description: 'Credenciales inválidas',
        type: ErrorAuthResponseDto,
        example: { status: ResponseStatus.ERROR, message: 'Credenciales inválidas', code: AuthErrorCode.AUTH_ERROR },
    })
);

export const RefreshDocs = applyDecorators(
    ApiOperation({ summary: 'Refrescar access_token usando refresh_token' }),
    ApiOkResponse({
        description: 'Nuevo access_token generado',
        type: OkAuthResponseDto,
        example: { status: ResponseStatus.SUCCESS, message: 'Token refreshed', code: AuthOkCode.REFRESH },
    }),
    ApiUnauthorizedResponse({
        description: 'Refresh token inválido o ausente',
        type: ErrorAuthResponseDto,
        example: { status: ResponseStatus.ERROR, message: 'No refresh token', code: AuthErrorCode.NO_TOKEN },
    })
);

export const LogoutDocs = applyDecorators(
    ApiOperation({ summary: 'Cerrar sesión y eliminar cookies de autenticación' }),
    ApiOkResponse({
        description: 'Logout exitoso',
        type: OkAuthResponseDto,
        example: { status: ResponseStatus.SUCCESS, message: 'Sesión cerrada', code: AuthOkCode.LOGOUT },
    })
);

export const ProfileDocs = applyDecorators(
    ApiCookieAuth(),
    ApiOperation({ summary: 'Obtener perfil completo del usuario autenticado' }),
    ApiOkResponse({
        description: 'Perfil del usuario con información completa incluyendo rol y permisos',
        type: ProfileResponseDto,
        example: {
            status: ResponseStatus.SUCCESS,
            message: 'Perfil obtenido correctamente',
            data: {
                userId: 1,
                roleId: 1,
                username: 'alexis_user',
                email: 'alexis@email.com',
                firstName: 'Alexis',
                lastName: 'García',
                phone: '5551234567',
                image: null,
                status: 'active',
                createdAt: '2025-08-11T02:26:31.818Z',
                updatedAt: '2025-08-11T02:26:31.818Z',
                deletedAt: null,
                role: {
                    roleId: 1,
                    name: 'Admin',
                    description: 'Administrador del sistema',
                    status: 'active',
                    createdAt: '2025-08-11T02:26:31.818Z',
                    updatedAt: '2025-08-11T02:26:31.818Z',
                    deletedAt: null,
                    permissions: [
                        {
                            permissionId: 1,
                            name: 'CreateUser',
                            description: 'Crear usuarios',
                        },
                        {
                            permissionId: 2,
                            name: 'ReadUser',
                            description: 'Leer usuarios',
                        },
                    ],
                },
            },
        },
    }),
    ApiUnauthorizedResponse({
        description: 'Token de acceso inválido o ausente',
        type: ErrorAuthResponseDto,
        example: {
            status: ResponseStatus.ERROR,
            message: 'Token inválido',
            code: AuthErrorCode.INVALID_TOKEN,
        },
    })
);

export const ChangePasswordDocs = applyDecorators(
    ApiCookieAuth(),
    ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' }),
    ApiParam({ name: 'userId', description: 'ID del usuario' }),
    ApiBody({ type: ChangePasswordDto, description: 'Datos para cambiar la contraseña' }),
    ApiOkResponse({
        description: 'Contraseña cambiada exitosamente',
        type: ResponseDto,
        example: {
            status: ResponseStatus.SUCCESS,
            message: 'Contraseña cambiada exitosamente',
        },
    }),
    ApiUnauthorizedResponse({
        description: 'Contraseña actual incorrecta o usuario no autenticado',
        type: ErrorAuthResponseDto,
        example: {
            status: ResponseStatus.ERROR,
            message: 'La contraseña actual es incorrecta',
            code: AuthErrorCode.AUTH_ERROR,
        },
    }),
    ApiBadRequestResponse({
        description: 'Nueva contraseña igual a la actual',
        type: ResponseDto,
        example: {
            status: ResponseStatus.ERROR,
            message: 'La nueva contraseña debe ser diferente a la contraseña actual',
        },
    })
);
