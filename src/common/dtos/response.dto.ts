import { ApiProperty } from '@nestjs/swagger';

export enum ResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error',
}

export class ResponseDto {
    @ApiProperty({ example: 'success', enum: ResponseStatus })
    status: ResponseStatus;

    @ApiProperty({ type: 'string', example: 'Operation completed successfully' })
    message: string;
}
