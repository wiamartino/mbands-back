import {
  IsString,
  IsInt,
  IsBoolean,
  IsArray,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Album } from '../../albums/entities/album.entity';
import { Member } from '../../members/entities/member.entity';
import { Event } from '../../events/entities/event.entity';

export class CreateBandDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly genre: string;

  @IsInt()
  readonly yearFormed: number;

  @IsString()
  readonly country: string;

  @IsBoolean()
  readonly active: boolean;

  @IsUrl()
  readonly website: string;

  @IsArray()
  @IsOptional()
  readonly members?: Member[];

  @IsArray()
  @IsOptional()
  readonly albums?: Album[];

  @IsArray()
  @IsOptional()
  readonly events?: Event[];
}
