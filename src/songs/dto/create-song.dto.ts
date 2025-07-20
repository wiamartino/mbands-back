import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Length,
  IsPositive,
  IsArray,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateSongDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  readonly title: string;

  @IsInt()
  @IsPositive()
  readonly bandId: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  readonly duration?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  readonly trackNumber?: number;

  @IsString()
  @IsOptional()
  readonly lyrics?: string;

  @IsUrl()
  @IsOptional()
  @Length(0, 500)
  readonly videoUrl?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  readonly albumIds?: number[];
}
