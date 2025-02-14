import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';
import { ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];
}
