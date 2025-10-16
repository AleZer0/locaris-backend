import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaFileType, ReferenceType } from 'generated/prisma';

export class UploadFilesMetadataDto {
    @ApiProperty({
        description: 'Bucket de S3 donde se almacenará el archivo',
        example: 'valnex-vehicles',
    })
    @IsNotEmpty()
    @IsString()
    bucket: string;

    @ApiProperty({
        description: 'Clave/ruta del archivo en S3',
        example: 'vehicles/123/frontal.jpg',
    })
    @IsNotEmpty()
    @IsString()
    objectKey: string;

    @ApiProperty({
        description: 'Tipo de archivo multimedia',
        example: 'VEHICLE_PHOTO',
    })
    @IsNotEmpty()
    @IsString()
    mediaFileType: MediaFileType;

    @ApiProperty({
        description: 'Tipo de referencia',
        example: 'VEHICLE',
    })
    @IsNotEmpty()
    @IsString()
    referenceType: ReferenceType;

    @ApiProperty({
        description: 'ID de referencia',
        example: 123,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    referenceId: number;

    @ApiProperty({
        description: 'ID de segunda referencia (opcional)',
        example: 456,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    secondReferenceId?: number;

    @ApiProperty({
        description: 'Descripción del archivo (opcional)',
        example: 'Foto frontal del vehículo',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'ID del usuario que crea el archivo (opcional)',
        example: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    createdBy?: number;

    @ApiProperty({
        description: 'Metadatos personalizados para S3 (opcional)',
        example: { author: 'Juan Pérez', department: 'Ventas' },
        required: false,
    })
    @IsOptional()
    @IsObject()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return {};
            }
        }
        return value;
    })
    metadata?: Record<string, string>;

    @ApiProperty({
        description: 'Tags para S3 (opcional)',
        example: { Environment: 'production', Project: 'vehicle-management' },
        required: false,
    })
    @IsOptional()
    @IsObject()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return {};
            }
        }
        return value;
    })
    tags?: Record<string, string>;
}
