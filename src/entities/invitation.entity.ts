import { SharedEntity } from '../common/model/sharedEntity';
import {
  Column,
  Entity,
} from 'typeorm';

@Entity()
export class Invitation extends SharedEntity {
    @Column()
    apiId: string

    @Column()
    apiAuthor: string

    @Column()
    inviteeEmail: string

    @Column()
    inviteeId: string

    @Column()
    token: string
}
