import {
  IsString,
  IsDateString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Length,
  IsPositive,
  IsEnum,
  IsBoolean,
  IsUrl,
  IsDecimal,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsDateString()
  readonly date: string;

  @IsInt()
  @IsPositive()
  readonly bandId: number;

  @IsEnum(['Concert', 'Festival', 'Tour', 'Recording', 'Interview', 'Other'])
  @IsOptional()
  readonly eventType?: string = 'Concert';

  @IsString()
  @IsOptional()
  @Length(1, 255)
  readonly venue?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  readonly city?: string;

  @IsInt()
  @IsOptional()
  @IsPositive()
  readonly countryId?: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  readonly ticketPrice?: number;

  @IsUrl()
  @IsOptional()
  @Length(0, 500)
  readonly ticketUrl?: string;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean = true;
}