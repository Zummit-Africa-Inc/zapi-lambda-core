import { Plans } from "src/common/enums/pricing-plans.enum";
import { SharedEntity } from "src/common/model/sharedEntity";
import { Column, Entity } from "typeorm";

@Entity()
export class Pricing extends SharedEntity {
    @Column({ type: 'enum', enum: Plans})
    planName: Plans;

    @Column()
    planPrice: string;

    @Column()
    requestDuration: string;
}