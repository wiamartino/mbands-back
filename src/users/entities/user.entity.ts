import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity()
@Index(['username'])
@Index(['email'])
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  userId: number;

  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
    maxLength: 50,
  })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiHideProperty()
  @Column({ length: 255 })
  password: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    maxLength: 100,
    required: false,
  })
  @Column({ nullable: true, length: 100 })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
    required: false,
  })
  @Column({ nullable: true, length: 100 })
  lastName: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @Column({ nullable: true })
  lastLoginAt: Date;

  @ApiProperty({
    description: 'Date when the user account was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user account was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the user account was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Roles assigned to the user',
    type: () => [Role],
  })
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];
}
