import { Test, TestingModule } from '@nestjs/testing';
import { ProductoTiendaService } from './producto-tienda.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { faker } from '@faker-js/faker';

describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let listaTiendas: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    tiendaRepository.clear();
    productoRepository.clear();

    listaTiendas = [];
    for (let i = 0; i < 5; i++) {
      const tienda: TiendaEntity = await tiendaRepository.save({
        nombre: faker.company.name(),
        ciudad: faker.location.countryCode('alpha-3'),
        direccion: faker.location.streetAddress()
      })
      listaTiendas.push(tienda);
    }

    producto = await productoRepository.save({
      nombre: faker.commerce.product(),
      precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }),
      tipo: "Perecedero",
      tiendas: listaTiendas
    })
  }

  it('addStoreToProduct debe agregar una tienda a un producto', async () => {
    const nuevaTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress()
    });

    const nuevoProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.commerce.product(),
      precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }),
      tipo: "Perecedero",
    })

    const result: ProductoEntity = await service.addStoreToProduct(nuevoProducto.id, nuevaTienda.id);

    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(nuevaTienda.nombre)
    expect(result.tiendas[0].ciudad).toBe(nuevaTienda.ciudad)
    expect(result.tiendas[0].direccion).toBe(nuevaTienda.direccion)
  });

  it('addStoreToProduct debe lanzar una execpcion por tienda invalida', async () => {
    const nuevoProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.commerce.product(),
      precio: faker.number.float({ min: 1, max: 100000000, precision: 0.001 }),
      tipo: "Perecedero"
    })
    await expect(() => service.addStoreToProduct(nuevoProducto.id, "0")).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.");
  })

  it('addStoreToProduct debe lanzar una execpcion por producto invalido', async () => {
    const nuevaTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress()
    });

    await expect(() => service.addStoreToProduct("0", nuevaTienda.id)).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.");
  });

  it('findStoreFromProduct debe retornar una tienda de un producto', async () => {
    const tienda: TiendaEntity = listaTiendas[0];
    const tiendaAlmacenada: TiendaEntity = await service.findStoreFromProduct(producto.id, tienda.id)
    expect(tiendaAlmacenada).not.toBeNull();
    expect(tiendaAlmacenada.nombre).toBe(tienda.nombre);
    expect(tiendaAlmacenada.ciudad).toBe(tienda.ciudad);
    expect(tiendaAlmacenada.direccion).toBe(tienda.direccion);
  });

  it('findStoreFromProduct debe retornar una excepcion por tienda invalida', async () => {
    await expect(() => service.findStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.");
  });

  it('findStoreFromProduct debe retornar una excepcion por producto invalido', async () => {
    const tienda: TiendaEntity = listaTiendas[0];
    await expect(() => service.findStoreFromProduct("0", tienda.id)).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.");
  });

  it('findStoreFromProduct debe retornar una excepcion por no haber asociacion entre tienda y producto', async () => {
    const nuevaTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress()
    });

    await expect(() => service.findStoreFromProduct(producto.id, nuevaTienda.id)).rejects.toHaveProperty("message", "La tienda con el id proporcionado no está asociada con el producto.");
  });

  it('findStoresFromProduct debe retornar las tiendas por producto', async () => {
    const tiendas: TiendaEntity[] = await service.findStoresFromProduct(producto.id);
    expect(tiendas.length).toBe(5);
  });

  it('findStoresFromProduct debe retornar una excepcion por un producto invalido', async () => {
    await expect(() => service.findStoresFromProduct("0")).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.");
  });


  it('updateStoresFromProduct debe actualizar la lista de tiendas de un producto', async () => {
    const nuevaTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress()
    });

    const productoActualizado: ProductoEntity = await service.updateStoresFromProduct(producto.id, [nuevaTienda]);
    expect(productoActualizado.tiendas.length).toBe(1);

    expect(productoActualizado.tiendas[0].nombre).toBe(nuevaTienda.nombre);
    expect(productoActualizado.tiendas[0].ciudad).toBe(nuevaTienda.ciudad);
    expect(productoActualizado.tiendas[0].direccion).toBe(nuevaTienda.direccion);
  });

  it('updateStoresFromProduct debe retornar una excepcion por un producto invalido', async () => {
    const nuevaTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress()
    });
    await expect(() => service.updateStoresFromProduct("0", [nuevaTienda])).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.");
  });

  it('updateStoresFromProduct debe retornar una excepcion por una tienda invalida', async () => {
    const nuevaTienda: TiendaEntity = listaTiendas[0];
    nuevaTienda.id = "0";
    await expect(() => service.updateStoresFromProduct(producto.id, [nuevaTienda])).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.");
  });

  it('deleteStoreFromProduct debe eliminar una tienda de un producto', async () => {
    const tienda: TiendaEntity = listaTiendas[0];

    await service.deleteStoreFromProduct(producto.id, tienda.id);

    const productoAlmacenado: ProductoEntity = await productoRepository.findOne({ where: { id: producto.id }, relations: ["tiendas"] });
    const tiendaEliminada: TiendaEntity = productoAlmacenado.tiendas.find(t => t.id === tienda.id);

    expect(tiendaEliminada).toBeUndefined();

  });

  it('deleteStoreFromProduct debe retornar una excepcion por una tienda invalida', async () => {
    await expect(() => service.deleteStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.");
  });

  it('deleteStoreFromProduct debe retornar una excepcion por un producto invalido', async () => {
    const tienda: TiendaEntity = listaTiendas[0];
    await expect(() => service.deleteStoreFromProduct("0", tienda.id)).rejects.toHaveProperty("message", "No se encontró un producto con el id proporcionado.");
  });

  it('deleteStoreFromProduct debe retornar una excepcion por no existir asociacion entre la tienda y el producto', async () => {
    const nuevaTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress()
    });

    await expect(() => service.deleteStoreFromProduct(producto.id, nuevaTienda.id)).rejects.toHaveProperty("message", "La tienda con el id proporcionado no está asociada con el producto.");
  });
});

