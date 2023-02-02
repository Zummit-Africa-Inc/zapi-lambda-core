import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { ContactUs } from 'src/entities/contactUs.entity';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contactUs.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepo: Repository<ContactUs>,
  ) {}

  async create(createContactUsDto: CreateContactDto): Promise<ContactUs> {
    try {
      const newContact = this.contactUsRepo.create({
        ...createContactUsDto,
      });
      const savedContactUs = await this.contactUsRepo.save(newContact);
      return savedContactUs;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }

  async findAll(): Promise<ContactUs[]> {
    try {
      return await this.contactUsRepo.find();
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }
}
