import { SharedEntity } from '../common/model/sharedEntity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Api } from './api.entity';

@Entity()
export class Category extends SharedEntity {
  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Api, (api) => api.category)
  @JoinColumn()
  api: Api[];
}
