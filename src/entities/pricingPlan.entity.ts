import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Api } from './api.entity';
import { Subscription } from './subscription.entity';
import { PricingName } from '../common/enums/pricing.enum';

@Entity()
export class PricingPlan extends SharedEntity {
  @Column({
    type: 'enum',
    enum: PricingName,
    default: PricingName.Basic,
  })
  name: PricingName;

  @Column({ default: 0 })
  price: number;

  @Column()
  apiId: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  requestLimit: number;

  @OneToMany(() => Subscription, (subscription) => subscription.pricingPlan)
  subscriptions: Subscription[];
}
