import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';
import { HttpMethod } from '.././common/enums/httpMethods.enum';

@Entity()
export class DevTesting extends SharedEntity {
  @Column()
  profileId: string;

  @Column()
  apiId: string;

  @Column()
  endpointId: string;

  @Column()
  route: string;

  @Column()
  method: HttpMethod;

  @Column()
  testName: string;
}
