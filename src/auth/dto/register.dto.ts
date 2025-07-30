import { IsString, IsEmail, IsNotEmpty, Length, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsStrongPassword } from '../validators/password.validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Username for registration',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @ApiProperty({
    description: 'Password for registration (must be strong: 8+ chars, uppercase, lowercase, number, special char)',
    example: 'MySecurePass123!',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @MinLength(8)
  @Length(8, 255)
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @Length(5, 255)
  email: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  lastName?: string;
}
