import { IsNotEmpty, IsString } from "class-validator";

export class PricingDto {
    @IsString()
    @IsNotEmpty()
    planName: string;

    @IsString()
    @IsNotEmpty()
    planPrice: string;

    @IsString()
    @IsNotEmpty()
    requesDuration: string;
}