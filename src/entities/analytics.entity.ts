import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Analytics extends SharedEntity {
  @Column({ default: 0 })
  totalLatency: number;

  @Column({ default: 0 })
  averageLatency: number;

  @Column({ nullable: true })
  apiId: string;

  @Column({ default: 0 })
  successful_calls: number;

  @Column({ default: 0 })
  total_calls: number;

  @Column({ default: 0 })
  total_errors: number;
}
