import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from './producto.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class ProductoService {

    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productoRepository: Repository<ProductoEntity>
    ) { }

    async findAll(): Promise<ProductoEntity[]> {
        return await this.productoRepository.find({ relations: ["tiendas"] });
    }

    async findOne(id: string): Promise<ProductoEntity> {
        const producto: ProductoEntity = await this.productoRepository.findOne({ where: { id }, relations: ["tiendas"] });
        if (!producto)
            throw new BusinessLogicException("No se encontró un producto con el id proporcionado.", BusinessError.NOT_FOUND);

        return producto;
    }

    async create(producto: ProductoEntity): Promise<ProductoEntity> {
        if (producto.tipo == "Perecedero" || producto.tipo == "No perecedero")
            return await this.productoRepository.save(producto);
        else
            throw new BusinessLogicException("El tipo de producto que intenta crear no es 'Perecedero' o 'No perecedero'.", BusinessError.PRECONDITION_FAILED);
    }

    async update(id: string, producto: ProductoEntity): Promise<ProductoEntity> {
        const productoAlmacendado: ProductoEntity = await this.productoRepository.findOne({ where: { id } });
        if (!productoAlmacendado)
            throw new BusinessLogicException("No se encontró un producto con el id proporcionado.", BusinessError.NOT_FOUND);

        if (producto.tipo == "Perecedero" || producto.tipo == "No perecedero")
            return await this.productoRepository.save({ ...productoAlmacendado, ...producto });
        else
            throw new BusinessLogicException("El tipo de producto que intenta actualizar no es 'Perecedero' o 'No perecedero'.", BusinessError.PRECONDITION_FAILED);
    }

    async delete(id: string) {
        const producto: ProductoEntity = await this.productoRepository.findOne({ where: { id } });
        if (!producto)
            throw new BusinessLogicException("No se encontró un producto con el id proporcionado.", BusinessError.NOT_FOUND);

        await this.productoRepository.remove(producto);
    }
}
