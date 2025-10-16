import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginationMetadataDto } from '../dtos/pagination-metadata.dto';

export class PaginationHelper {
    static createMetadata(query: PaginationQueryDto, totalRecords: number): PaginationMetadataDto {
        const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc', search } = query;

        const totalPages = Math.ceil(totalRecords / limit);
        const currentPage = page;
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        const previousPage = currentPage > 1 ? currentPage - 1 : null;

        return {
            currentPage,
            nextPage,
            previousPage,
            totalPages,
            totalRecords,
            recordsPerPage: limit,
            sortBy,
            sortOrder,
            searchTerm: search || null,
        };
    }

    static getSkipCount(page: number = 1, limit: number = 10): number {
        return (page - 1) * limit;
    }

    static validateSortField(sortBy: string, allowedFields: string[]): string {
        return allowedFields.includes(sortBy) ? sortBy : allowedFields[0];
    }
}
