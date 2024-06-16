import { Album } from 'src/albums/entities/album.entity';
import { Member } from '../../members/entities/member.entity';

export class CreateBandDto {
  readonly name: string;
  readonly genre: string;
  readonly yearFormed: number;
  readonly members: Member[];
  readonly albums: Album[];
}
