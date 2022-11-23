import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';
import { HttpMethod } from '.././common/enums/httpMethods.enum';
import { ReqBody } from 'src/common/interfaces/endpoint.interface';

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
  name: string;

  @Column('jsonb', {
    default: () => "'{}'",
    nullable: true,
  })
  payload: ReqBody;
}
