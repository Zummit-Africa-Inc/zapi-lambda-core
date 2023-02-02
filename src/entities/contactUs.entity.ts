import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';
import { ContactEnum } from '../common/enums/contact.enum';
@Entity()
export class ContactUs extends SharedEntity {
  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: true })
  org_name: string;

  @Column()
  email: string;

  @Column({ nullable: true, default: false })
  phone_call: boolean;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: ContactEnum,
    default: ContactEnum.Other,
  })
  goal: ContactEnum;
}
