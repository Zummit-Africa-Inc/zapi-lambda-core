import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsOptional()
    @ApiProperty()
    name: string;

    @IsOptional()
    @ApiProperty()
    description: string;
}
