import { Entity, Column, OneToOne } from 'typeorm';
import { SharedEntity } from '../common/model/sharedEntity';
import { PriceGroup } from './price-group.entity';

@Entity()
export class Pricing extends SharedEntity {
  @Column()
  planName: string;

  @Column()
  planPrice: string;

  @Column()
  requestDuration: string;

  @OneToOne((type) => PriceGroup, { nullable: true })
  priceGroup: PriceGroup;
}
