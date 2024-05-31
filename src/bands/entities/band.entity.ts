import { Album } from 'src/albums/entities/album.entity';
import { Member } from 'src/members/entities/member.entity';
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

  @OneToMany(() => Member, (member) => member.band)
  members: string[];

  @OneToMany(() => Album, (album) => album.band)
  albums: string[];

  @Column()
  website: string;
}
