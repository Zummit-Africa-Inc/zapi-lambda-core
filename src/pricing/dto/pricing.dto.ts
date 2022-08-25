import { IsNotEmpty, IsString } from "class-validator";
import { Plans } from "src/common/enums/pricing-plans.enum";

export class PricingDto {
    @IsString()
    @IsNotEmpty()
    planPrice: Plans;

    @IsString()
    @IsNotEmpty()
    requestDuration: string;
}