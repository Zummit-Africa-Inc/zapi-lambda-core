import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { ContactUs } from 'src/entities/contactUs.entity';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contactUs.dto';

@ApiTags('ContactUs')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('contactUs')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post('/create')
  async create(
    @Body() createContactDto: CreateContactDto,
  ): Promise<Ok<ContactUs>> {
    const contact = await this.contactService.create(createContactDto);
    return ZaLaResponse.Ok(contact, 'Contact message created', '201');
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available Contact messages' })
  async findAll(): Promise<Ok<ContactUs[]>> {
    const contactUs = await this.contactService.findAll();
    return ZaLaResponse.Ok(contactUs, 'Ok', '200');
  }

  @Public()
  @Get('/:id')
  @ApiOperation({ summary: 'Get one Contact message' })
  async findOne(@Param('id') id: string): Promise<Ok<ContactUs>> {
    const contactUs = await this.contactService.findOne(id);
    return ZaLaResponse.Ok(contactUs, 'Ok', '200');
  }
}
