import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateExpoPushTokenDto {
    @ApiProperty({
        example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        description: 'Token de Expo Push Notifications para el usuario',
    })
    @IsString({ message: 'El token debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El token es requerido' })
    @Matches(/^ExponentPushToken\[.+\]$/, {
        message: 'El token debe tener el formato válido de Expo Push Token',
    })
    expoPushToken: string;
}
