import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Api } from './api.entity';

@Entity()
export class Discussion extends SharedEntity {
  @Column()
  author: string;

  @Column()
  body: string;

  @ManyToOne(() => Api, (api) => api.discussions, { onDelete: 'CASCADE' })
  api: Api;
}
