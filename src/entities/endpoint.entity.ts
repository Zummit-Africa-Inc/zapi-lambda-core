import { SharedEntity } from '../common/model/sharedEntity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { HttpMethod } from '../common/enums/httpMethods.enum';
import { ReqBody } from '../common/interfaces/endpoint.interface';

@Entity()
export class Endpoint extends SharedEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: HttpMethod,
    default: HttpMethod.GET,
    nullable: true,
  })
  method: HttpMethod;

  @Column()
  route: string;

  @Column()
  apiId: string;

  @Column()
  description: string;

  @Column('text', {
    array: true,
    nullable: true,
  })
  headers: object[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  requestBody: ReqBody[];

  @BeforeInsert()
  public modifyRoute() {
    this.route = encodeURIComponent(
      this.route.charAt(0) === '/' ? this.route : `/${this.route}`,
    );
    return this.route;
  }
}
