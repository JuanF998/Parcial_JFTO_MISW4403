import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from './producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity])],
  providers: [ProductoService]
})
export class ProductoModule {}
