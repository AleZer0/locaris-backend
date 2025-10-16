import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@/config/config.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SimpleStorageModule } from '@/modules/configuration/storage/storage.module';

@Module({
    imports: [ConfigModule, PrismaModule, forwardRef(() => AuthModule), SimpleStorageModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
