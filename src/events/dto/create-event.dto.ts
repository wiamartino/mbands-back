import { IsString, IsDate, IsInt } from 'class-validator';

export class CreateEventDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsDate()
  readonly date: Date;

  @IsInt()
  readonly bandId: number;
}