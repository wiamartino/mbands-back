import { Album } from '../../albums/entities/album.entity';
import { Member } from '../../members/entities/member.entity';
import { Event } from '../../events/entities/event.entity';
import { Song } from '../../songs/entities/song.entity';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  Index
} from 'typeorm';

@Entity()
@Index(['genre', 'country'])
@Index(['yearFormed'])
@Index(['active'])
export class Band {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ length: 100 })
  genre: string;

  @Column({ type: 'int', comment: 'Year the band was formed (must be between 1900 and current year)' })
  yearFormed: number;

  @Column({ length: 100 })
  country: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true, length: 500 })
  website: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Member, (member) => member.band, { cascade: true })
  members: Member[];

  @OneToMany(() => Album, (album) => album.band, { cascade: true })
  albums: Album[];

  @OneToMany(() => Song, (song) => song.band, { cascade: true })
  songs: Song[];

  @OneToMany(() => Event, (event) => event.band, { cascade: true })
  events: Event[];
}