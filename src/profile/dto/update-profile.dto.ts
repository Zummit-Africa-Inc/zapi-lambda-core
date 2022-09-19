import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  picture?: string;

}




// import { PartialType } from '@nestjs/swagger';
// import { CreateProfileDto } from './create-profile.dto';

// export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
