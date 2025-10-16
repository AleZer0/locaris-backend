import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UserService } from '@/modules/administration/user/user.service';
import { ResponseStatus } from '@/common/dtos/response.dto';
import { AuthLoginDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async signIn(signInDto: AuthLoginDto): Promise<{ access_token: string; refresh_token: string }> {
        const { username, password } = signInDto;
        const user = await this.userService.findByEmailOrUsername(username);

        if (!user) {
            throw new UnauthorizedException({
                status: ResponseStatus.ERROR,
                message: 'El usuario ingresado no existe',
            });
        }

        if (!(await compare(password, user.password))) {
            throw new UnauthorizedException({
                status: ResponseStatus.ERROR,
                message: `${user.firstName} tu contraseña es incorrecta`,
            });
        }

        const payload = { sub: Number(user.userId), username: user.email };
        const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
        const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

        return { access_token, refresh_token };
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const access_token = await this.jwtService.signAsync(
                { sub: payload.sub, username: payload.username },
                { expiresIn: '15m' }
            );
            return { access_token };
        } catch {
            throw new ForbiddenException('Invalid refresh token');
        }
    }

    async getProfile(userId: number) {
        const user = await this.userService.findOne(userId);
        return user;
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        await this.userService.updatePassword(userId, currentPassword, newPassword);
    }
}
