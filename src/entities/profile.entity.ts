import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Api } from './api.entity';

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

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  fullName: string;

  @OneToMany(() => Api, (api) => api.profile)
  apis: Api[];
}
