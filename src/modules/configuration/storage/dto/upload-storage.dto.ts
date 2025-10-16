import { CreateStorageDto } from './create-storage.dto';

export interface UploadVehicleStorageDto extends CreateStorageDto {
    content: Buffer | Uint8Array | string;
    metadata?: Record<string, string>;
    tags?: Record<string, string>;
}
