import { SharedEntity } from "../common/model/sharedEntity";
import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { Comment } from "./comments.entity";

@Entity()
export class Discussion extends SharedEntity{
    @Column()
    api_id: string;

    @Column('text',{array: true, nullable: true, default: []})
    comments: string[];

    @Column()
    title: string;

    @Column()
    body: string;

    @OneToMany(()=> Comment, (comment) => {comment.id}, {onDelete: 'SET NULL'})
    @JoinColumn({name : 'comments'})
    comment: Comment[];

    @Column()
    profile_id: string
}