import { SharedEntity } from '../common/model/sharedEntity';
import { Entity, ManyToOne, OneToOne, JoinColumn, Column } from 'typeorm';
import { Api } from './api.entity';
import { Pricing } from './pricing.entity';

@Entity()
export class PriceGroup extends SharedEntity {
  @ManyToOne(() => Api, (api) => api.priceGroup)
  @JoinColumn()
  api: Api;

  @Column({ nullable: true })
  apiId: string;

  @OneToOne(() => Pricing)
  @JoinColumn()
  pricing: Pricing;

  @Column({ nullable: true })
  pricingId: string;
}
