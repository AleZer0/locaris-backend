import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@/config/config.service';
import { ResponseStatus } from '@/common/dtos/response.dto';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromCookie(request);

        // Si no hay token en cookie
        if (!token) {
            throw new UnauthorizedException({
                status: ResponseStatus.ERROR,
                message: 'Sesión expirada o token no encontrado. Intenta refrescar el token.',
                code: 'NO_TOKEN',
            });
        }

        // Validar JWT token
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.jwtSecret,
            });
            request['user'] = payload;
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                throw new UnauthorizedException({
                    status: ResponseStatus.ERROR,
                    message: 'Token expirado. Intenta refrescar el token.',
                    code: 'TOKEN_EXPIRED',
                });
            }
            if (err.name === 'JsonWebTokenError') {
                throw new UnauthorizedException({
                    status: ResponseStatus.ERROR,
                    message: 'Token inválido. Por favor inicia sesión de nuevo.',
                    code: 'INVALID_TOKEN',
                });
            }
            throw new UnauthorizedException({
                status: ResponseStatus.ERROR,
                message: 'Error de autenticación. Por favor inicia sesión.',
                code: 'AUTH_ERROR',
            });
        }
        return true;
    }

    private extractTokenFromCookie(request: Request): string | undefined {
        if (request.cookies && request.cookies['access_token']) {
            return request.cookies['access_token'];
        }
        return undefined;
    }
}
