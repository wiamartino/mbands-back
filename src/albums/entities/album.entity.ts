import { Band } from '../../bands/entities/band.entity';
import { Song } from '../../songs/entities/song.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  releaseDate: Date;

  @Column({ nullable: true })
  genre: string;

  @ManyToOne(() => Band, (band) => band.albums)
  band: Band;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  producer: string;

  @ManyToMany(() => Song)
  @JoinTable()
  songs: Song[];

  @Column({ nullable: true })
  website: string;
}
