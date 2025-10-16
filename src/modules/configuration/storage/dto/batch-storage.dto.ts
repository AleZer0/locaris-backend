import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStorageDto } from './create-storage.dto';

export class StorageItem {
    @ApiProperty({ example: 'my-bucket' })
    @IsString()
    @IsNotEmpty()
    bucket: string;

    @ApiProperty({ example: 'vehicles/images/vehicle-123.jpg' })
    @IsString()
    @IsNotEmpty()
    objectKey: string;

    @ApiPropertyOptional({ example: 'application/jpg', description: 'Tipo de archivo' })
    @IsOptional()
    @IsString()
    contentType?: string;

    @ApiPropertyOptional({ example: 'j8923roiufhy98', required: false, nullable: true })
    @IsOptional()
    @IsString()
    versionId?: string;
}

export class StorageItemWithUrls extends StorageItem {
    @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/key?signed-url' })
    @IsString()
    @IsNotEmpty()
    uploadUrl?: string;

    @ApiPropertyOptional({
        example: 'https://s3.amazonaws.com/bucket/key?download-signed-url',
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    downloadUrl?: string;
}

export class CreateManyStorageDto {
    @ApiProperty({
        type: [CreateStorageDto],
        description: 'Lista de archivos para crear',
        example: [
            {
                mediaFileType: 'image',
                referenceType: 'vehicle',
                referenceId: 1,
                bucket: 'my-bucket',
                objectKey: 'vehicles/images/vehicle-123.jpg',
                contentType: 'image/jpeg',
                createdBy: 1,
            },
        ],
    })
    @IsArray({ message: 'Los items deben ser un array' })
    @ArrayMinSize(1, { message: 'Debe proporcionar al menos un item' })
    @ValidateNested({ each: true })
    @Type(() => CreateStorageDto)
    items: CreateStorageDto[];
}

export class DeleteManyStorageDto {
    @ApiProperty({
        type: [String],
        description: 'Lista de UUIDs de archivos para eliminar',
        example: ['uuid-1', 'uuid-2', 'uuid-3'],
    })
    @IsArray({ message: 'Los UUIDs deben ser un array' })
    @ArrayMinSize(1, { message: 'Debe proporcionar al menos un UUID' })
    @IsString({ each: true, message: 'Cada UUID debe ser un string' })
    @IsNotEmpty({ each: true, message: 'Los UUIDs no pueden estar vacíos' })
    uuids: string[];
}
