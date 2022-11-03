import { SharedEntity } from "../common/model/sharedEntity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Discussion } from "./discussion.entity";

@Entity()
export class Comment extends SharedEntity{
    @Column({nullable: true})
    discussion_id: string; 

    @Column()
    body: string;

    @Column({default: false})
    is_parent: boolean;

    @Column('text',{array: true, nullable: true, default: []})
    child_comment_ids: string[] 

    @ManyToOne(()=>Discussion, (discussion)=>discussion.id, { onDelete: 'CASCADE' })
    discussion: Discussion

    @Column()
    profile_id: string
}