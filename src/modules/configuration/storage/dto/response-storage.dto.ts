import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '@/common/dtos/response.dto';
import { StorageDto, StorageSimple } from './storage.dto';
import { PaginationResponseDto } from '@/common/dtos/pagination-metadata.dto';
import { StorageItemWithUrls } from './batch-storage.dto';

export class StorageResponseObjDto extends ResponseDto {
    @ApiProperty({ type: () => StorageDto })
    data: StorageDto;
}

export class StorageResponseArrDto extends PaginationResponseDto<StorageSimple> {}

export class StorageWithUrlsResponseObjDto extends ResponseDto {
    @ApiProperty({ type: () => StorageSimple })
    data: StorageSimple;
}

export class StorageWithUrlsResponseArrDto extends PaginationResponseDto<StorageSimple> {}

export class StorageItemWhitUrlResponseDto extends ResponseDto {
    @ApiProperty({ type: () => StorageItemWithUrls })
    data: StorageItemWithUrls[];
}

export class UploadMultipleResponseDto extends ResponseDto {
    @ApiProperty({
        type: 'object',
        properties: {
            successful: {
                type: 'array',
                items: { $ref: '#/components/schemas/StorageDto' },
            },
            failed: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        objectKey: { type: 'string' },
                        error: { type: 'string' },
                    },
                },
            },
        },
    })
    data: {
        successful: StorageDto[];
        failed: Array<{
            objectKey: string;
            error: string;
        }>;
    };
}
