import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Endpoint } from './endpoint.entity';

@Entity()
export class EndpointFolder extends SharedEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  apiId: string;

  @OneToMany(() => Endpoint, (endpoint) => endpoint.folder)
  endpoints: Endpoint[];
}
