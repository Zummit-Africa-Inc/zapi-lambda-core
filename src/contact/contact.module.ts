import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from 'src/entities/contactUs.entity';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  imports: [TypeOrmModule.forFeature([ContactUs])],
})
export class ContactModule {}
