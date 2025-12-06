import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class Role {
  @ApiProperty({
    description: 'Unique identifier for the role',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the role',
    example: 'admin',
    maxLength: 50,
  })
  @Column({ unique: true, length: 50 })
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator with full system access',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Date when the role was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the role was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the role was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Users assigned to this role',
    type: () => [User],
  })
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
