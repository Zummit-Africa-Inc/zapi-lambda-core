import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Profile } from './profile.entity';
import { Api } from './api.entity';

@Entity()
export class Subscription extends SharedEntity {
  @Column()
  apiId: string;

  @Column()
  profileId: string;

  @ManyToOne(() => Api, (api) => api.subscription, {
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
