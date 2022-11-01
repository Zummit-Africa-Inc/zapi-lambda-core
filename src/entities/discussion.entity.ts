import { SharedEntity } from "../common/model/sharedEntity";
import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { Comments } from "./comments.entity";

@Entity()
export class Discussion extends SharedEntity{
    @Column()
    api_id: string;

    @Column('text',{array: true, nullable: true})
    comment_ids: string[];

    @Column()
    title: string;

    @Column()
    body: string;

    @OneToMany(()=> Comments, (comments) => {comments.id}, {onDelete: 'CASCADE'})
    @JoinColumn({name : 'comment_ids'})
    comments: Comments[];
}