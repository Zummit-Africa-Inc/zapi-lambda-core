import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity()
export class Profile extends SharedEntity {
  @Column()
  email: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  picture: string;

  @Column('text', { array: true, nullable: true, default: [] })
  subscriptions: string[];

  @OneToMany(() => Subscription, (subscription) => subscription.profile, {
    onDelete: 'CASCADE',
  })
  subscription: Subscription[];
}
