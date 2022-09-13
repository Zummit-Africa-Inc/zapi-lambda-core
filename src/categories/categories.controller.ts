import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post('/create')
  @ApiOperation({summary: 'Create a new category'})
  async create(@Body() createCategoryDto: CreateCategoryDto):Promise<Ok<Category>> {
    const category = await this.categoryService.createNewCategory(createCategoryDto);
    return ZaLaResponse.Ok(category, 'Category created', '201')
  }

  @Get()
  @ApiOperation({summary: 'Get all available category'})
  async findAll(): Promise<Ok<Category[]>>{
    const allCategories = await this.categoryService.findAllCategory();
    return ZaLaResponse.Ok(allCategories, 'Ok', '200')
  }

  @Get('apis/:categoryId')
  @ApiOperation({summary:"get all apis in a particular category"})
  findAllApis(@Param('categoryId') categoryId: string) {
    return this.categoryService.getAllApis(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }


  
}
