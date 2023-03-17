import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
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
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Api } from 'src/entities/api.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthenticationGuard)
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
  @ApiOperation({ summary: 'Get all available category' })
  async findAll(): Promise<Ok<Category[]>> {
    const allCategories = await this.categoryService.findAllCategory();
    return ZaLaResponse.Ok(allCategories, 'Ok', '200');
  }

  @Get(':categoryId/apis')
  @IdCheck('categoryId')
  @Public()
  @ApiOperation({ summary: 'get all public apis in a particular category' })
  async findAllApis(
    @Paginate() query: PaginateQuery,
    @Param('categoryId') categoryId: string,
  ): Promise<Ok<Paginated<Api>>> {
    const apis = await this.categoryService.getAllApis({
      ...query,
      filter: { ...query.filter, categoryId },
    });
    return ZaLaResponse.Paginated(apis, 'Ok', '200');
  }

  @Get('/valid-categories')
  @ApiOperation({
    summary: 'get all valid categories that an api can be added to',
  })
  async getAllValidCategories(): Promise<Ok<Category[]>> {
    const validCategories = await this.categoryService.getAllValidCategories();
    return ZaLaResponse.Ok(validCategories, 'Ok', '200');
  }

  // @Delete('/:categoryId/:generalCategoryId')
  // @IdCheck('categoryId')
  // @ApiOperation({summary: "delete a category"})
  // async deleteCategory(
  //   @Param('categoryId') categoryId: string,
  //   @Param('generalCategoryId') generalCategoryId: string
  // ){
  //   await this.categoryService.deleteCategory(categoryId, generalCategoryId)
  //   return ZaLaResponse.Ok('Category deleted', 'OK', '200')
  // }
}
