import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsPositive, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaFileType, ReferenceType, GeneralStatus } from 'generated/prisma';
import { PaginationQueryDto } from '@/common/dtos/pagination-query.dto';

export class StorageFilterDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        example: 'mediaFileId',
        enum: [
            'mediaFileId',
            'mediaFileUuid',
            'contentType',
            'contentLength',
            'lastModified',
            'mediaFileType',
            'referenceType',
            'referenceId',
            'secondReferenceId',
        ],
        default: 'mediaFileId',
    })
    @IsOptional()
    @IsIn([
        'mediaFileId',
        'mediaFileUuid',
        'contentType',
        'contentLength',
        'lastModified',
        'mediaFileType',
        'referenceType',
        'referenceId',
        'secondReferenceId',
    ])
    sortBy?: string = 'mediaFileId';

    @ApiPropertyOptional({
        description: 'Filtrar por tipo de archivo multimedia',
        enum: MediaFileType,
        example: MediaFileType.image,
    })
    @IsOptional()
    @IsEnum(MediaFileType, { message: 'El tipo de archivo multimedia debe ser válido' })
    mediaFileType?: MediaFileType;

    @ApiPropertyOptional({
        description: 'Filtrar por tipo de referencia',
        enum: ReferenceType,
        example: ReferenceType.vehicle,
    })
    @IsOptional()
    @IsEnum(ReferenceType, { message: 'El tipo de referencia debe ser válido' })
    referenceType?: ReferenceType;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de referencia',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El ID de referencia debe ser un entero' })
    @IsPositive({ message: 'El ID de referencia debe ser positivo' })
    referenceId?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de segunda referencia',
        example: 2,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El ID de segunda referencia debe ser un entero' })
    @IsPositive({ message: 'El ID de segunda referencia debe ser positivo' })
    secondReferenceId?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por estado',
        enum: GeneralStatus,
        example: GeneralStatus.active,
    })
    @IsOptional()
    @IsEnum(GeneralStatus, { message: 'El estado debe ser válido' })
    status?: GeneralStatus;

    @ApiPropertyOptional({
        description: 'Filtrar por ID del creador',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El ID del creador debe ser un entero' })
    @IsPositive({ message: 'El ID del creador debe ser positivo' })
    createdBy?: number;
}
