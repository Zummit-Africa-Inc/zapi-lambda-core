import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ContactEnum } from 'src/common/enums/contact.enum';

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiPropertyOptional()
  org_name: string;

  @ApiPropertyOptional()
  phone_call: boolean;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  goal: ContactEnum;
}
