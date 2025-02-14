import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

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
