import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Band } from '../../bands/entities/band.entity';

@Entity()
export class Member {
  @ApiProperty({
    description: 'Unique identifier for the member',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the band member',
    example: 'John Lennon',
    maxLength: 255,
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Primary instrument played by the member',
    example: 'Guitar',
    enum: ['Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Other'],
  })
  @Column({
    type: 'enum',
    enum: ['Guitar', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Other'],
  })
  instrument: string;

  @ApiProperty({
    description: 'Date when the member joined the band',
    example: '1960-08-01',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  joinDate: Date;

  @ApiProperty({
    description: 'Date when the member left the band',
    example: '1970-04-10',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  leaveDate: Date;

  @ApiProperty({
    description: 'Whether the member is currently active in the band',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Biography or description of the member',
    example: 'Lead guitarist and primary songwriter of The Beatles',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  biography: string;

  @ApiProperty({
    description: 'Date when the member record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the member record was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the member record was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'The band this member belongs to',
    type: () => Band,
  })
  @ManyToOne(() => Band, (band) => band.members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;
}
