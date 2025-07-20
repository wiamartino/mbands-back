import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Length,
  IsPositive,
  IsDateString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  readonly name: string;

  @IsInt()
  @IsPositive()
  readonly bandId: number;

  @IsDateString()
  @IsOptional()
  readonly releaseDate?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  readonly genre?: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  readonly label?: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  readonly producer?: string;

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
  readonly coverImageUrl?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  readonly totalTracks?: number;
}
