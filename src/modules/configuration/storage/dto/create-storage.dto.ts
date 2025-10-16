import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsInt, IsPositive, IsOptional } from 'class-validator';
import { MediaFileType, ReferenceType } from 'generated/prisma';

export class CreateStorageDto {
    @ApiProperty({
        enum: MediaFileType,
        example: MediaFileType.image,
        description: 'Tipo de archivo multimedia',
    })
    @IsEnum(MediaFileType, { message: 'El tipo de archivo multimedia debe ser válido' })
    mediaFileType: MediaFileType;

    @ApiProperty({
        enum: ReferenceType,
        example: ReferenceType.vehicle,
        description: 'Tipo de referencia',
    })
    @IsEnum(ReferenceType, { message: 'El tipo de referencia debe ser válido' })
    referenceType: ReferenceType;

    @ApiProperty({
        example: 1,
        description: 'ID de la referencia',
    })
    @IsInt({ message: 'El ID de referencia debe ser un entero' })
    @IsPositive({ message: 'El ID de referencia debe ser positivo' })
    referenceId: number;

    @ApiPropertyOptional({
        example: 2,
        description: 'ID de la segunda referencia (opcional)',
    })
    @IsOptional()
    @IsInt({ message: 'El ID de segunda referencia debe ser un entero' })
    @IsPositive({ message: 'El ID de segunda referencia debe ser positivo' })
    secondReferenceId?: number | null;

    @ApiProperty({
        example: 'valnex-files',
        description: 'Nombre del bucket de almacenamiento',
    })
    @IsString({ message: 'El bucket debe ser un string' })
    @IsNotEmpty({ message: 'El bucket es obligatorio' })
    bucket: string;

    @ApiProperty({
        example: 'vehicles/images/vehicle-123.jpg',
        description: 'Clave del objeto en el bucket',
    })
    @IsString({ message: 'La clave del objeto debe ser un string' })
    @IsNotEmpty({ message: 'La clave del objeto es obligatoria' })
    objectKey: string;

    @ApiPropertyOptional({
        example: 'v1.0',
        description: 'ID de versión del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El ID de versión debe ser un string' })
    versionId?: string;

    @ApiPropertyOptional({
        example: 'image/jpeg',
        description: 'Tipo de contenido del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El tipo de contenido debe ser un string' })
    @IsNotEmpty({ message: 'El tipo de contenido es obligatorio' })
    contentType?: string | null;

    @ApiPropertyOptional({
        example: '1024000',
        description: 'Tamaño del archivo en bytes',
    })
    @IsOptional()
    @IsString({ message: 'El tamaño debe ser un string' })
    @IsNotEmpty({ message: 'El tamaño es obligatorio' })
    contentLength?: string | null;

    @ApiPropertyOptional({
        example: 'd41d8cd98f00b204e9800998ecf8427e',
        description: 'ETag del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El ETag debe ser un string' })
    etag?: string | null;

    @ApiPropertyOptional({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Fecha de última modificación del archivo',
    })
    @IsOptional()
    @IsString({ message: 'La fecha de última modificación debe ser un string' })
    lastModified?: string | null;

    @ApiPropertyOptional({
        example: 'sha256:abc123...',
        description: 'Checksum del archivo',
    })
    @IsOptional()
    @IsString({ message: 'El checksum debe ser un string' })
    checksum?: string | null;

    @ApiPropertyOptional({
        example: 'Imagen frontal del vehículo',
        description: 'Descripción del archivo',
    })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser un string' })
    description?: string | null;

    @ApiPropertyOptional({
        example: 1,
        description: 'ID del usuario que creó el archivo',
    })
    @IsOptional()
    @IsInt({ message: 'El ID del creador debe ser un entero' })
    @IsPositive({ message: 'El ID del creador debe ser positivo' })
    createdBy?: number | null;
}
