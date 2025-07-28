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
import { Band } from '../../bands/entities/band.entity';
import { Event } from '../../events/entities/event.entity';

@Entity()
@Index(['name'])
@Index(['code'])
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 3, comment: 'ISO 3166-1 alpha-3 country code' })
  code: string;

  @Column({ unique: true, length: 2, comment: 'ISO 3166-1 alpha-2 country code' })
  alpha2Code: string;

  @Column({ type: 'int', nullable: true, comment: 'ISO 3166-1 numeric country code' })
  numericCode: number;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 100, nullable: true })
  subregion: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Band, (band) => band.country, { cascade: true })
  bands: Band[];

  @OneToMany(() => Event, (event) => event.country, { cascade: true })
  events: Event[];
}
