import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Index
} from 'typeorm';
import { Band } from '../../bands/entities/band.entity';

@Entity()
@Index(['date'])
@Index(['eventType'])
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  date: Date;

  @Column({ 
    type: 'enum',
    enum: ['Concert', 'Festival', 'Tour', 'Recording', 'Interview', 'Other'],
    default: 'Concert'
  })
  eventType: string;

  @Column({ length: 255, nullable: true })
  venue: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ticketPrice: number;

  @Column({ nullable: true, length: 500 })
  ticketUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Band, (band) => band.events, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;
}
