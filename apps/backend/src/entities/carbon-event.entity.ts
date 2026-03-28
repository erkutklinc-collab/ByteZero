import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('carbon_events')
export class CarbonEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventType: string; // e.g. 'email_deleted', 'attachment_removed', 'cache_cleared'

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>; // flexible payload: { sizeBytes, count, etc. }

  @Column('float')
  co2Grams: number; // computed CO2 impact in grams

  @ManyToOne(() => User, (user) => user.events)
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
