import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@/config/config.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
    imports: [ConfigModule, AuthModule],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule {}
