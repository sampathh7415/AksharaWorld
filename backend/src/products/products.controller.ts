import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
} from './dto/product.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.products.findAll(search, lowStock === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.products.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Req() req: { user: { id: string } }) {
    return this.products.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.products.update(id, dto, req.user.id);
  }

  @Post(':id/stock')
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.products.adjustStock(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.products.remove(id, req.user.id);
  }
}
