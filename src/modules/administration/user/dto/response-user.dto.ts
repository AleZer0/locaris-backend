import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '@/common/dtos/response.dto';
import { UserDto } from './user.dto';
import { PaginationResponseDto } from '@/common/dtos/pagination-metadata.dto';

export class UserResponseObjDto extends ResponseDto {
    @ApiProperty({ type: () => UserDto })
    data: UserDto;
}

export class UserResponseArrDto extends PaginationResponseDto<UserDto> {}
