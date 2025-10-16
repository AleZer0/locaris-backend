import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';

export class PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Número de página (empezando desde 1)',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Número de elementos por página',
        example: 10,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar',
        example: 'id',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'id';

    @ApiPropertyOptional({
        description: 'Orden de clasificación',
        example: 'asc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'asc';

    @ApiPropertyOptional({
        description: 'Término de búsqueda general',
    })
    @IsOptional()
    @IsString()
    search?: string;
}
