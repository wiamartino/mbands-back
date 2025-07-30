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
import { ApiProperty } from '@nestjs/swagger';
import { Band } from '../../bands/entities/band.entity';
import { Event } from '../../events/entities/event.entity';

@Entity()
@Index(['name'])
@Index(['code'])
export class Country {
  @ApiProperty({
    description: 'Unique identifier for the country',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Country name',
    example: 'United Kingdom',
    maxLength: 100,
  })
  @Column({ unique: true, length: 100 })
  name: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-3 country code',
    example: 'GBR',
    maxLength: 3,
  })
  @Column({ unique: true, length: 3, comment: 'ISO 3166-1 alpha-3 country code' })
  code: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'GB',
    maxLength: 2,
  })
  @Column({ unique: true, length: 2, comment: 'ISO 3166-1 alpha-2 country code' })
  alpha2Code: string;

  @ApiProperty({
    description: 'ISO 3166-1 numeric country code',
    example: 826,
    required: false,
  })
  @Column({ type: 'int', nullable: true, comment: 'ISO 3166-1 numeric country code' })
  numericCode: number;

  @ApiProperty({
    description: 'Geographic region',
    example: 'Europe',
    maxLength: 100,
    required: false,
  })
  @Column({ length: 100, nullable: true })
  region: string;

  @ApiProperty({
    description: 'Geographic subregion',
    example: 'Northern Europe',
    maxLength: 100,
    required: false,
  })
  @Column({ length: 100, nullable: true })
  subregion: string;

  @ApiProperty({
    description: 'Whether the country is active in the system',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the country record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the country record was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the country record was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Bands from this country',
    type: () => [Band],
  })
  @OneToMany(() => Band, (band) => band.country, { cascade: true })
  bands: Band[];

  @ApiProperty({
    description: 'Events in this country',
    type: () => [Event],
  })
  @OneToMany(() => Event, (event) => event.country, { cascade: true })
  events: Event[];
}
