import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity } from 'typeorm';
import { FeedbackEnum } from '../common/enums/feedback.enum';
@Entity()
export class Feedback extends SharedEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  body: string;

  @Column({
    type: 'enum',
    enum: FeedbackEnum,
    default: FeedbackEnum.Feedback,
  })
  category: FeedbackEnum;
}
