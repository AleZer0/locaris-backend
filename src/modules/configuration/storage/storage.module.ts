import { Module } from '@nestjs/common';
import { SimpleStorageService } from './storage.service';
import { SimpleStorageController } from './storage.controller';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
    imports: [ConfigModule, PrismaModule, AuthModule, StorageModule],
    controllers: [SimpleStorageController],
    providers: [SimpleStorageService],
    exports: [SimpleStorageService],
})
export class SimpleStorageModule {}
