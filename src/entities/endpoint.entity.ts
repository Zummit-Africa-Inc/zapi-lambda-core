import { SharedEntity } from '../common/model/sharedEntity';
import { AfterLoad, BeforeInsert, Column, Entity } from 'typeorm';
import { HttpMethod } from '../common/enums/httpMethods.enum';
import { HeaderType, ReqBody } from 'src/common/interfaces/endpoint.interface';

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

  @Column('jsonb', {
    default: () => "'[]'",
    nullable: false,
  })
  headers: HeaderType[];

  @Column('jsonb', {
    default: () => "'[]'",
  })
  query: HeaderType[];

  @Column('jsonb', {
    default: () => "'[]'",
  })
  body: ReqBody[];

  /* A hook that runs before the entity is inserted into the database. It is used to modify the route property of the entity. */
  @BeforeInsert()
  public modifyRoute() {
    this.route = encodeURIComponent(
      this.route.charAt(0) === '/' ? this.route : `/${this.route}`,
    );
    return this.route;
  }

  /* A hook that runs each time the entity is loaded. It is used to modify the route property of the entity. */
  @AfterLoad()
  public DecodeRoute() {
    this.route = decodeURIComponent(this.route);
    return this.route;
  }
}
