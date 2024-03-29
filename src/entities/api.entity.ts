import { SharedEntity } from '../common/model/sharedEntity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
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

  @Column({ nullable: true })
  read_me: string;

  @Column('text', { array: true, nullable: true, default: [] })
  subscriptions: string[];

  @Column('text', { array: true, nullable: true, default: [] })
  contributors: string[];

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

  @Column({ default: 0, type: 'decimal', scale: 1, precision: 3 })
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

  @ManyToOne(() => Profile, (profile) => profile.apis, { onDelete: 'CASCADE' })
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

  /* A lifecycle hook that is called before the entity is inserted into the database. */
  @BeforeInsert()
  public onInsert() {
    this.base_url =
      this.base_url.slice(-1) === '/'
        ? this.base_url.slice(0, -1)
        : this.base_url;
    return this.base_url;
  }
}
