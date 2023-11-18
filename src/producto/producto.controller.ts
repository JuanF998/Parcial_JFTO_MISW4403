import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { ProductoDto } from './producto.dto';
import { ProductoEntity } from './producto.entity';
import { plainToInstance } from 'class-transformer';

@UseInterceptors(BusinessErrorsInterceptor)
@Controller('products')
export class ProductoController {
    constructor(private readonly productoService: ProductoService) { }

    @Get()
    async findAll() {
        return await this.productoService.findAll();
    }

    @Get(':productoId')
    async findOne(@Param('productoId') productoId: string) {
        return await this.productoService.findOne(productoId);
    }

    @Post()
    async create(@Body() productoDto: ProductoDto) {
        const producto: ProductoEntity = plainToInstance(ProductoEntity, productoDto);
        return await this.productoService.create(producto);
    }

    @Put(':productoId')
    async update(@Param('productoId') productoId: string, @Body() productoDto: ProductoDto) {
        const producto: ProductoEntity = plainToInstance(ProductoEntity, productoDto);
        return await this.productoService.update(productoId, producto);
    }

    @Delete(':productId')
    @HttpCode(204)
    async delete(@Param('productoId') productoId: string) {
        return await this.productoService.delete(productoId);
    }
}
