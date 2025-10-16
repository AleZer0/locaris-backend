import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { UserDto } from '@/modules/administration/user/dto/user.dto';

export class UserResponse {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
}

export enum AuthOkCode {
    LOGIN = 'LOGIN_SUCCESS',
    REFRESH = 'REFRESH_SUCCESS',
    LOGOUT = 'LOGOUT_SUCCESS',
}

export enum AuthErrorCode {
    NO_TOKEN = 'NO_TOKEN',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    AUTH_ERROR = 'AUTH_ERROR',
}

export class OkAuthResponseDto extends ResponseDto {
    @ApiPropertyOptional({ enum: AuthOkCode, example: AuthOkCode.LOGIN })
    code?: AuthOkCode;
}

export class ProfileResponseDto extends ResponseDto {
    @ApiProperty({ type: () => UserDto })
    data: UserDto;
}

export class ErrorAuthResponseDto extends ResponseDto {
    @ApiPropertyOptional({ enum: AuthErrorCode, example: AuthErrorCode.NO_TOKEN })
    code?: AuthErrorCode;
}
