import { SharedEntity } from "../common/model/sharedEntity";
import { Column, Entity } from "typeorm";

@Entity()
export class Pricing extends SharedEntity {
    @Column()
    planName: string;

    @Column()
    planPrice: string;

    @Column()
    requestDuration: string;
}