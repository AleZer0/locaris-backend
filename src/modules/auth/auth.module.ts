import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '../../config/config.module';
import { UserModule } from '@/modules/administration/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigService } from '../../config/config.service';

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => UserModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.jwtSecret,
                signOptions: { expiresIn: '60s' },
            }),
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {}
