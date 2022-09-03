import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity()
export class Profile extends SharedEntity {
  @Column()
  email: string;

  @Column()
  userId: string;

  @Column('text', { array: true, nullable: true, default: [] })
  subscriptions: string[];

  @Column({ nullable: true })
  picture: string;

  @OneToMany(() => Subscription, (subscription) => subscription.profile, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subscriptions' })
  subscription: Subscription[];
}
