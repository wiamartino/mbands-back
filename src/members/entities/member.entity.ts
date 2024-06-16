import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Band } from '../../bands/entities/band.entity';

@Entity()
export class Member {
  @Column()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals'],
  })
  instrument: string;

  @ManyToOne(() => Band, (band) => band.members)
  band: Band;
}
