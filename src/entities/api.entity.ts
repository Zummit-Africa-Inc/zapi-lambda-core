import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Status } from '../common/enums/apiVerification.enum';
import { Profile } from './profile.entity';
import { Category } from './category.entity';
import { Visibility } from '../common/enums/visibility.enum';
import { Subscription } from './subscription.entity';
@Entity()
export class Api extends SharedEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  base_url: string;

  @Column({ default: 0 })
  popularity: number;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  api_website: string;

  @Column({ nullable: true })
  term_of_use: string;

  @Column('text', { array: true, nullable: true, default: [] })
  subscriptions: string[];

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Unverified,
  })
  status: Status;

  @Column({
    type: 'enum',
    enum: Visibility,
    default: Visibility.Private,
  })
  visibility: Visibility;

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  service_level: number;

  @Column({ default: 0 })
  latency: number;

  @Column()
  categoryId: string;

  @Column()
  profileId: string;

  @Column({ nullable: true })
  secretKey: string;

  @Column({ nullable: true })
  tutorialsId: string;

  @ManyToOne(() => Profile, (profile) => profile.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @ManyToOne(() => Category, (category) => category.api)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Subscription, (subscription) => subscription.api, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subscriptions' })
  subscription: Subscription[];
}
