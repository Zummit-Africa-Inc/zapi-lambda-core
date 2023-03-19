import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Api } from './api.entity';
import { PricingName } from '../common/enums/pricing.enum';

@Entity()
export class Pricing extends SharedEntity {
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

  @ManyToOne(() => Api, (api) => api.pricingPlans)
  api: Api;
}
