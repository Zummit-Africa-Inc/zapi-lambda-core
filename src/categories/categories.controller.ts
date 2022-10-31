import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Public } from 'src/common/decorators/publicRoute.decorator';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Ok<Category>> {
    const category = await this.categoryService.createNewCategory(
      createCategoryDto,
    );
    return ZaLaResponse.Ok(category, 'Category created', '201');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all available category' })
  async findAll(): Promise<Ok<Category[]>> {
    const allCategories = await this.categoryService.findAllCategory();
    return ZaLaResponse.Ok(allCategories, 'Ok', '200');
  }

  @Get(':categoryId/apis')
  @IdCheck('categoryId')
  @ApiOperation({ summary: 'get all apis in a particular category' })
  findAllApis(@Param('categoryId') categoryId: string) {
    return this.categoryService.getAllApis(categoryId);
  }

  @Get('/valid-categories')
  @ApiOperation({
    summary: 'get all valid categories that an api can be added to',
  })
  async getAllValidCategories(): Promise<Ok<Category[]>> {
    const validCategories = await this.categoryService.getAllValidCategories();
    return ZaLaResponse.Ok(validCategories, 'Ok', '200');
  }

  @Delete('/:categoryId/:generalCategoryId')
  @IdCheck('categoryId')
  @ApiOperation({summary: "delete a category"})
  async deleteCategory(
    @Param('categoryId') categoryId: string,
    @Param('generalCategoryId') generalCategoryId: string
  ){
    await this.categoryService.deleteCategory(categoryId, generalCategoryId)
    return ZaLaResponse.Ok('Category deleted', 'OK', '200')
  }

  @Patch('/:categoryId')
  @IdCheck('categoryId')
  @ApiOperation({summary: "Update category name or description"})
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto
  ){
    await this.categoryService.updateCategory(categoryId, dto)
    return ZaLaResponse.Ok('Category updated', 'OK', '200')
  }

}
