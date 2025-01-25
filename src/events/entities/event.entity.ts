import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Band } from '../../bands/entities/band.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @ManyToOne(() => Band, (band) => band.events)
  band: Band;
}
