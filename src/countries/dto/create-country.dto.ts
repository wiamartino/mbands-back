import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'Code must be a 3-letter uppercase ISO 3166-1 alpha-3 code',
  })
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, {
    message: 'Alpha2Code must be a 2-letter uppercase ISO 3166-1 alpha-2 code',
  })
  readonly alpha2Code: string;

  @IsInt()
  @IsOptional()
  readonly numericCode?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  readonly region?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  readonly subregion?: string;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean = true;
}
