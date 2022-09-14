import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class AnalyticsLogs extends SharedEntity {
  @Column({ nullable: true })
  latency: number;

  @Column()
  profileId: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column()
  status: number;

  @Column()
  apiId: string;

  @Column()
  endpoint: string;

  @Column()
  method: string;
}
