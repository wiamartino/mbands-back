import { Album } from '../../albums/entities/album.entity';
import { Member } from '../../members/entities/member.entity';
import { Event } from '../../events/entities/event.entity';
import { Song } from '../../songs/entities/song.entity';
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

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  website: string;

  @OneToMany(() => Member, (member) => member.band, { cascade: true })
  members: Member[];

  @OneToMany(() => Album, (album) => album.band, { cascade: true })
  albums: Album[];

  @OneToMany(() => Song, (song) => song.band, { cascade: true })
  songs: Song[];

  @OneToMany(() => Event, (event) => event.band, { cascade: true })
  events: Event[];
}