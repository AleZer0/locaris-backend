import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AuthLoginDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'Nombre de usuario o correo electrónico',
        examples: {
            email: {
                summary: 'Usando email',
                value: 'usuario@email.com',
            },
            username: {
                summary: 'Usando username',
                value: 'alexis_user',
            },
        },
    })
    @IsString({ message: 'El nombre de usuario o email debe ser un string' })
    username: string;

    @ApiProperty({ example: 'supersecreto123', description: 'Contraseña del usuario', minLength: 6 })
    @IsString({ message: 'La contraseña debe ser un string' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}

export class ChangePasswordDto {
    @ApiProperty({
        example: 'contraseña_actual123',
        description: 'Contraseña actual del usuario',
    })
    @IsString({ message: 'La contraseña actual debe ser un string' })
    @MinLength(1, { message: 'La contraseña actual es requerida' })
    currentPassword: string;

    @ApiProperty({
        example: 'nueva_contraseña123',
        description: 'Nueva contraseña del usuario',
        minLength: 6,
    })
    @IsString({ message: 'La nueva contraseña debe ser un string' })
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    newPassword: string;
}
