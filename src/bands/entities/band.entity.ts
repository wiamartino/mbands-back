import { Album } from '../../albums/entities/album.entity';
import { Member } from '../../members/entities/member.entity';
import { Event } from '../../events/entities/event.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Band {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  genre: string;

  @Column()
  yearFormed: number;
  @Column()
  country: string;

  @Column()
  active: boolean;

  @OneToMany(() => Member, (member) => member.band, { cascade: true })
  members: Member[];

  @OneToMany(() => Album, (album) => album.band, { cascade: true })
  albums: Album[];

  @OneToMany(() => Event, (event) => event.band, { cascade: true })
  events: Event[];

  @Column()
  website: string;
}
