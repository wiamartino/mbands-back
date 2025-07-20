import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Length,
  IsPositive,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  readonly name: string;

  @IsEnum(['Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Other'])
  readonly instrument: string;

  @IsInt()
  @IsPositive()
  readonly bandId: number;

  @IsDateString()
  @IsOptional()
  readonly joinDate?: string;

  @IsDateString()
  @IsOptional()
  readonly leaveDate?: string;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean = true;

  @IsString()
  @IsOptional()
  readonly biography?: string;
}
