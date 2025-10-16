import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from './response.dto';

export class PaginationMetadataDto {
    @ApiProperty({
        description: 'Página actual',
        example: 1,
    })
    currentPage: number;

    @ApiProperty({
        description: 'Siguiente página (null si es la última)',
        example: 2,
        nullable: true,
    })
    nextPage: number | null;

    @ApiProperty({
        description: 'Página anterior (null si es la primera)',
        example: null,
        nullable: true,
    })
    previousPage: number | null;

    @ApiProperty({
        description: 'Total de páginas',
        example: 5,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Total de registros',
        example: 50,
    })
    totalRecords: number;

    @ApiProperty({
        description: 'Registros por página',
        example: 10,
    })
    recordsPerPage: number;

    @ApiProperty({
        description: 'Campo por el cual están ordenados los datos',
        example: 'id',
    })
    sortBy: string;

    @ApiProperty({
        description: 'Orden de clasificación aplicado',
        example: 'asc',
        enum: ['asc', 'desc'],
    })
    sortOrder: 'asc' | 'desc';

    @ApiProperty({
        description: 'Término de búsqueda aplicado (si existe)',
        example: 'john',
        nullable: true,
    })
    searchTerm: string | null;
}

export class PaginationResponseDto<T> extends ResponseDto {
    @ApiProperty({ type: 'array', items: { type: 'object' } })
    data: T[];

    @ApiProperty({ type: () => PaginationMetadataDto })
    metadata?: PaginationMetadataDto;
}
