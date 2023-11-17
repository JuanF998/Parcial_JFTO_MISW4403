import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TiendaEntity } from './tienda.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class TiendaService {
    constructor(
        @InjectRepository(TiendaEntity)
        private readonly tiendaRepository: Repository<TiendaEntity>
    ) { }

    async findAll(): Promise<TiendaEntity[]> {
        return await this.tiendaRepository.find({ relations: ["productos"] });
    }

    async findOne(id: string): Promise<TiendaEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({ where: { id }, relations: ["productos"] });
        if (!tienda)
            throw new BusinessLogicException("No se encontró una tienda con el id proporcionado.", BusinessError.NOT_FOUND);

        return tienda;
    }

    async create(tienda: TiendaEntity): Promise<TiendaEntity> {
        if (tienda.ciudad.length === 3){
            tienda.ciudad = tienda.ciudad.toUpperCase();
            return await this.tiendaRepository.save(tienda);
        }   
        else
            throw new BusinessLogicException("La ciudad de la tienda debe ser un código de tres caracteres (e.g., SMR, BOG, MED).", BusinessError.PRECONDITION_FAILED);
    }

    async update(id: string, tienda: TiendaEntity): Promise<TiendaEntity> {
        const tiendaAlmacendada: TiendaEntity = await this.tiendaRepository.findOne({ where: { id } });
        if (!tiendaAlmacendada)
            throw new BusinessLogicException("No se encontró una tienda con el id proporcionado.", BusinessError.NOT_FOUND);

        if (tienda.ciudad.length === 3) {
            tienda.ciudad = tienda.ciudad.toUpperCase();
            return await this.tiendaRepository.save({ ...tiendaAlmacendada, ...tienda });
        }
        else
            throw new BusinessLogicException("La ciudad de la tienda que intenta actualizar debe ser un código de tres caracteres (e.g., SMR, BOG, MED).", BusinessError.PRECONDITION_FAILED);
    }

    async delete(id: string) {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({ where: { id } });
        if (!tienda)
            throw new BusinessLogicException("No se encontró una tienda con el id proporcionado.", BusinessError.NOT_FOUND);

        await this.tiendaRepository.remove(tienda);
    }
}
