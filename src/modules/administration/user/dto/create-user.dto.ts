import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, Min, MaxLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    role: string;

    @ApiProperty({ example: 'j.perez' })
    @IsString()
    @MaxLength(60)
    username: string;

    @ApiProperty({ example: 'alexis@email.com' })
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({ example: 'example_password_secrto$123', minLength: 12, maxLength: 60 })
    @IsString()
    @MinLength(12)
    @MaxLength(60)
    password: string;

    @ApiPropertyOptional({ example: 'Juan' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    firstName?: string | null;

    @ApiPropertyOptional({ example: 'Perez' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    lastName?: string | null;

    @ApiPropertyOptional({ example: '"+525551234567"' })
    @IsOptional()
    @IsString()
    @MaxLength(13)
    phone?: string | null;
}
