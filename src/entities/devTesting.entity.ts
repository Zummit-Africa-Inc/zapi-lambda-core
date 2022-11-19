import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class DevTesting extends SharedEntity {
  @Column()
  url: string;

  @Column()
  route: string;

  @Column()
  method: string;

  @Column()
  requestStatus: string;

  @Column()
  profileId: string;
}
