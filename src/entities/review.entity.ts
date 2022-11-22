import { SharedEntity } from "../common/model/sharedEntity";
import { Column, Entity } from "typeorm";

@Entity()
export class Review extends SharedEntity{
    @Column()
    profile_id: string

    @Column()
    api_id: string

    @Column({nullable: true})
    review: string
    
    @Column()
    rating: number

    @Column()
    reviewer: string
}