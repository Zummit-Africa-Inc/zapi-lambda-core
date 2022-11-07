import { SharedEntity } from '../common/model/sharedEntity';
import { Column } from 'typeorm';
import { FeedbackEnum } from '../common/enums/feedback.enum';

export class Feedback extends SharedEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
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
