import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  JoinColumn
} from 'typeorm';
import { Band } from '../../bands/entities/band.entity';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Other'],
  })
  instrument: string;

  @Column({ type: 'date', nullable: true })
  joinDate: Date;

  @Column({ type: 'date', nullable: true })
  leaveDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Band, (band) => band.members, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;
}
