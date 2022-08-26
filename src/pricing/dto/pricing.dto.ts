import { IsNotEmpty, IsString } from "class-validator";
import { Plans } from "../../common/enums/pricing-plans.enum"

export class PricingDto {
    @IsString()
    @IsNotEmpty()
    planPrice: Plans;

    @IsString()
    @IsNotEmpty()
    requestDuration: string;
}