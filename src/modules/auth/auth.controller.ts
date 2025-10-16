import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthLoginDto, ChangePasswordDto } from './dto/auth.dto';
import { ResponseDto, ResponseStatus } from '@/common/dtos/response.dto';
import { ConfigService } from '@/config/config.service';
import {
    AuthOkCode,
    OkAuthResponseDto,
    AuthErrorCode,
    ErrorAuthResponseDto,
    ProfileResponseDto,
} from './dto/response-auth.dto';
import { LoginDocs, RefreshDocs, LogoutDocs, ProfileDocs, ChangePasswordDocs } from './docs/auth.docs';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) {}

    @LoginDocs
    @Post('login')
    async signIn(
        @Body() signInDto: AuthLoginDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<OkAuthResponseDto> {
        const { access_token, refresh_token } = await this.authService.signIn(signInDto);
        const isProd = this.configService.environment === 'production';

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            status: ResponseStatus.SUCCESS,
            message: 'Sesión iniciada',
            code: AuthOkCode.LOGIN,
        };
    }

    @RefreshDocs
    @Get('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<OkAuthResponseDto | ErrorAuthResponseDto> {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            res.status(401);
            return { status: ResponseStatus.ERROR, message: 'No refresh token', code: AuthErrorCode.NO_TOKEN };
        }
        const { access_token } = await this.authService.refreshToken(refreshToken);
        const isProd = this.configService.environment === 'production';
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000,
        });
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Token refreshed',
            code: AuthOkCode.REFRESH,
        };
    }

    @LogoutDocs
    @Delete('logout')
    async logout(@Res({ passthrough: true }) res: Response): Promise<OkAuthResponseDto> {
        const isProd = this.configService.environment === 'production';
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
        });
        return { status: ResponseStatus.SUCCESS, message: 'Sesión cerrada', code: AuthOkCode.LOGOUT };
    }

    @ProfileDocs
    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Req() req): Promise<ProfileResponseDto> {
        const data = await this.authService.getProfile(req.user.sub);
        return { status: ResponseStatus.SUCCESS, message: 'Perfil obtenido correctamente', data };
    }

    @ChangePasswordDocs
    @UseGuards(AuthGuard)
    @Put('change-password/:userId')
    async changePassword(
        @Param('userId') userId: number,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<ResponseDto> {
        await this.authService.changePassword(Number(userId), changePasswordDto);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Contraseña cambiada exitosamente',
        };
    }
}
