import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';
import {LoggerJson} from '../../src/common/interfaces/loggerJson.interface'
import { Action } from '../common/enums/actionLogger.enum';


@Entity()
export class Logger extends SharedEntity {
  @Column()
  entity_type: string;

  @Column()
  identifier: string;

  @Column({
    type: 'enum',
    enum: Action,
    default: Action.Update
  })
  action_type: Action

  @Column({
    type: 'json',
    nullable: true
   })
  previous_values: LoggerJson ;

  @Column({type:'json',nullable: true })
  new_values: LoggerJson ;

  @Column()
  operated_by: string;

}
