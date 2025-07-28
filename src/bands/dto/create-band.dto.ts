import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsUrl,
  IsNotEmpty,
  Length,
  Min,
  Max,
  IsPositive,
} from 'class-validator';

export class CreateBandDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  readonly genre: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  readonly yearFormed: number;

  @IsInt()
  @IsPositive()
  readonly countryId: number;

  @IsBoolean()
  @IsOptional()
  readonly active?: boolean = true;

  @IsUrl()
  @IsOptional()
  @Length(0, 500)
  readonly website?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsUrl()
  @IsOptional()
  @Length(0, 500)
  readonly imageUrl?: string;
}
