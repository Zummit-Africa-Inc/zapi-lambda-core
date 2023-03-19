import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Profile } from './profile.entity';
import { Api } from './api.entity';
import { Pricing } from './pricingPlan.entity';

@Entity()
export class Subscription extends SharedEntity {
  @Column()
  apiId: string;

  @Column()
  profileId: string;

  @Column({ default: 0 })
  requestLimit: number;

  @Column({ default: 0 })
  requestCount: number;

  @Column()
  pricingId: string;

  @ManyToOne(() => Api, (api) => api.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'apiId' })
  api: Api;

  @ManyToOne(() => Profile, (profile) => profile.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column()
  subscriptionToken: string;
}
