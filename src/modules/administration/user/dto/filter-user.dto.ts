import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn, IsNumber, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dtos/pagination-query.dto';
import { Type } from 'class-transformer';

export class UserFilterDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar (específico para usuarios)',
        example: 'username',
        enum: ['id', 'username', 'email', 'firstName', 'lastName'],
    })
    @IsOptional()
    @IsIn(['id', 'username', 'email', 'firstName', 'lastName'])
    sortBy?: string = 'id';

    @ApiPropertyOptional({
        description: 'Filtrar usuarios por de rol',
        example: 1,
        type: Number,
    })
    @IsOptional()
    @IsString({ message: 'El role debe ser un texto' })
    role?: string;

}
