import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Band } from '../../bands/entities/band.entity';
import { Country } from '../../countries/entities/country.entity';

@Entity()
@Index(['date'])
@Index(['eventType'])
export class Event {
  @ApiProperty({
    description: 'Unique identifier for the event',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  version: number;

  @ApiProperty({
    description: 'Title of the event',
    example: 'Live at Wembley Stadium',
    maxLength: 255,
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: 'An epic concert performance at the legendary Wembley Stadium',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Date and time of the event',
    example: '2023-06-15T20:00:00.000Z',
  })
  @Column()
  date: Date;

  @ApiProperty({
    description: 'Type of event',
    example: 'Concert',
    enum: ['Concert', 'Festival', 'Tour', 'Recording', 'Interview', 'Other'],
    default: 'Concert',
  })
  @Column({
    type: 'enum',
    enum: ['Concert', 'Festival', 'Tour', 'Recording', 'Interview', 'Other'],
    default: 'Concert',
  })
  eventType: string;

  @ApiProperty({
    description: 'Venue where the event takes place',
    example: 'Wembley Stadium',
    maxLength: 255,
    required: false,
  })
  @Column({ length: 255, nullable: true })
  venue: string;

  @ApiProperty({
    description: 'City where the event takes place',
    example: 'London',
    maxLength: 100,
    required: false,
  })
  @Column({ length: 100, nullable: true })
  city: string;

  @ApiProperty({
    description: 'Ticket price for the event',
    example: 89.5,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ticketPrice: number;

  @ApiProperty({
    description: 'URL where tickets can be purchased',
    example: 'https://ticketmaster.com/event/123',
    maxLength: 500,
    required: false,
  })
  @Column({ nullable: true, length: 500 })
  ticketUrl: string;

  @ApiProperty({
    description: 'Whether the event is active/available',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the event record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the event record was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the event record was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'The band performing at this event',
    type: () => Band,
  })
  @ManyToOne(() => Band, (band) => band.events, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ApiProperty({
    description: 'The country where this event takes place',
    type: () => Country,
    required: false,
  })
  @ManyToOne(() => Country, (country) => country.events, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
