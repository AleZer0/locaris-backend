import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    roleId?: number;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    yardId?: number | null;

    @ApiPropertyOptional({ example: 'alexis_user' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    username?: string;

    @ApiPropertyOptional({ example: 'alexis@email.com' })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiPropertyOptional({ example: 'Alexis' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    firstName?: string | null;

    @ApiPropertyOptional({ example: 'García' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    lastName?: string | null;

    @ApiPropertyOptional({ example: '"5551234567"' })
    @IsOptional()
    @IsString()
    @MaxLength(13)
    phone?: string | null;
}
