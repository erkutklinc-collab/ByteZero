import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Department } from './department.entity';
import { CarbonEvent } from './carbon-event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Department, (dept) => dept.users)
  department: Department;

  @Column()
  departmentId: number;

  @OneToMany(() => CarbonEvent, (event) => event.user)
  events: CarbonEvent[];
}
