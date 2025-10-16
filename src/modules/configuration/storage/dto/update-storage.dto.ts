import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, IsPositive } from 'class-validator';
import { MediaFileType, ReferenceType } from 'generated/prisma';

export class UpdateStorageDto {
    @ApiPropertyOptional({
        enum: MediaFileType,
        example: MediaFileType.pdf,
        description: 'Tipo de archivo multimedia',
    })
    @IsOptional()
    @IsEnum(MediaFileType, { message: 'El tipo de archivo multimedia debe ser válido' })
    mediaFileType?: MediaFileType;

    @ApiPropertyOptional({
        enum: ReferenceType,
        example: ReferenceType.maintenance,
        description: 'Tipo de referencia',
    })
    @IsOptional()
    @IsEnum(ReferenceType, { message: 'El tipo de referencia debe ser válido' })
    referenceType?: ReferenceType;

    @ApiPropertyOptional({
        example: 2,
        description: 'ID de la referencia',
    })
    @IsOptional()
    @IsInt({ message: 'El ID de referencia debe ser un entero' })
    @IsPositive({ message: 'El ID de referencia debe ser positivo' })
    referenceId?: number;

    @ApiPropertyOptional({
        example: 3,
        description: 'ID de la segunda referencia (opcional)',
    })
    @IsOptional()
    @IsInt({ message: 'El ID de segunda referencia debe ser un entero' })
    @IsPositive({ message: 'El ID de segunda referencia debe ser positivo' })
    secondReferenceId?: number;

    @ApiPropertyOptional({
        example: 'valnex-files-updated',
        description: 'Nombre del bucket de almacenamiento',
    })
    @IsOptional()
    @IsString({ message: 'El bucket debe ser un string' })
    bucket?: string;

    @ApiPropertyOptional({
        example: 'vehicles/images/vehicle-123-updated.jpg',
        description: 'Clave del objeto en el bucket',
    })
    @IsOptional()
    @IsString({ message: 'La clave del objeto debe ser un string' })
    objectKey?: string;

    @ApiPropertyOptional({
        example: 'v2.0',
        description: 'ID de versión del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El ID de versión debe ser un string' })
    versionId?: string;

    @ApiPropertyOptional({
        example: 'image/png',
        description: 'Tipo de contenido del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El tipo de contenido debe ser un string' })
    contentType?: string;

    @ApiPropertyOptional({
        example: '2048000',
        description: 'Tamaño del archivo en bytes',
    })
    @IsOptional()
    @IsString({ message: 'El tamaño debe ser un string' })
    contentLength?: string;

    @ApiPropertyOptional({
        example: 'e41d8cd98f00b204e9800998ecf8427f',
        description: 'ETag del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El ETag debe ser un string' })
    etag?: string;

    @ApiPropertyOptional({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Fecha de última modificación del archivo',
    })
    @IsOptional()
    @IsString({ message: 'La fecha de última modificación debe ser un string' })
    lastModified?: string;

    @ApiPropertyOptional({
        example: 'sha256:def456...',
        description: 'Checksum del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El checksum debe ser un string' })
    checksum?: string;

    @ApiPropertyOptional({
        example: 'Imagen lateral del vehículo',
        description: 'Descripción del archivo',
    })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser un string' })
    description?: string;
}
