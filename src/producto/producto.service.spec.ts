import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoService } from './producto.service';
import { ProductoEntity } from './producto.entity';
import { faker } from '@faker-js/faker';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let listaProductos: ProductoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    listaProductos = [];
    for (let i = 0; i < 5; i++) {
      const producto: ProductoEntity = await repository.save({
        nombre: faker.commerce.product(),
        precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }),
        tipo: "Perecedero"
      })
      listaProductos.push(producto);
    }
  }

  it('findAll debe retornar todos los productos', async () => {
    const productos: ProductoEntity[] = await service.findAll();
    expect(productos).not.toBeNull();
    expect(productos).toHaveLength(listaProductos.length);
  });

  it('findOne debe retornar un producto por id', async () => {
    const productoAlmacenado: ProductoEntity = listaProductos[0];
    const producto: ProductoEntity = await service.findOne(productoAlmacenado.id);
    expect(producto).not.toBeNull();
    expect(producto.nombre).toEqual(productoAlmacenado.nombre);
    expect(producto.tipo).toEqual(productoAlmacenado.tipo);
    expect(producto.precio).toEqual(productoAlmacenado.precio);
  });

  it('findOne debe lanzar un excepcion para un producto invalido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.")
  });

  it('create debe retornar un nuevo producto', async () => {
    const producto: ProductoEntity = {
      id: "",
      nombre: faker.commerce.product(),
      precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }),
      tipo: "Perecedero",
      tiendas: []
    }

    const nuevoProducto: ProductoEntity = await service.create(producto);
    expect(nuevoProducto).not.toBeNull();

    const productoAlmacenado: ProductoEntity = await repository.findOne({ where: { id: nuevoProducto.id } })
    expect(productoAlmacenado).not.toBeNull();
    expect(productoAlmacenado.nombre).toEqual(nuevoProducto.nombre)
    expect(productoAlmacenado.precio).toEqual(nuevoProducto.precio)
    expect(productoAlmacenado.tipo).toEqual(nuevoProducto.tipo)
  });

  it('create debe retornar una excepcion que indica que el tipo de producto no es correcto', async () => {
    const producto: ProductoEntity = {
      id: "",
      nombre: faker.commerce.product(),
      precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }),
      tipo: "2",
      tiendas: []
    }

    await expect(() => service.create(producto)).rejects.toHaveProperty("message", "El tipo de producto que intenta crear no es 'Perecedero' o 'No perecedero'.")
  });

  it('update debe modificar un producto', async () => {
    const producto: ProductoEntity = listaProductos[0];
    producto.nombre = faker.commerce.product();
    producto.precio = faker.number.float({ min: 1, max: 100000000, precision: 0.001 });
    producto.tipo = "No perecedero"
    const productoActualizado: ProductoEntity = await service.update(producto.id, producto);
    expect(productoActualizado).not.toBeNull();
    const productoAlmacenado: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(productoAlmacenado).not.toBeNull();
    expect(productoAlmacenado.nombre).toEqual(producto.nombre)
    expect(productoAlmacenado.precio).toEqual(producto.precio)
    expect(productoAlmacenado.tipo).toEqual(producto.tipo)
  });

  it('update debe retornar una excepcion que indica que el tipo de producto no es correcto', async () => {
    const producto: ProductoEntity = listaProductos[0];
    producto.nombre = faker.commerce.product();
    producto.precio = faker.number.float({ min: 1, max: 100000000, precision: 0.001 });
    producto.tipo = "3"
    await expect(() => service.update(producto.id, producto)).rejects.toHaveProperty("message", "El tipo de producto que intenta actualizar no es 'Perecedero' o 'No perecedero'.")
  });

  it('update debe retornar una excepcion por un producto invalido', async () => {
    let producto: ProductoEntity = listaProductos[0];
    producto = {
      ...producto, nombre: faker.commerce.product(), precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }), tipo: "Perecedero"
    }
    await expect(() => service.update("0", producto)).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.")
  });

  it('delete debe eliminar un producto', async () => {
    const producto: ProductoEntity = listaProductos[0];
    await service.delete(producto.id);
     const productoEliminado: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(productoEliminado).toBeNull();
  });

  it('delete debe retornar una excepcion por producto invalido', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.")
  });
});
