import { SharedEntity } from '../common/model/sharedEntity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
