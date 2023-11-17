import { Test, TestingModule } from '@nestjs/testing';
import { TiendaService } from './tienda.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { TiendaEntity } from './tienda.entity';
import { faker } from '@faker-js/faker';


describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>
  let listaTiendas: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    listaTiendas = [];
    for (let i = 0; i < 5; i++) {
      const tienda: TiendaEntity = await repository.save({
        nombre: faker.company.name(),
        ciudad: faker.location.countryCode('alpha-3'),
        direccion: faker.location.streetAddress()
      })
      listaTiendas.push(tienda);
    }
  }

  it('findAll debe retornar todas las tiendas', async () => {
    const tiendas: TiendaEntity[] = await service.findAll();
    expect(tiendas).not.toBeNull();
    expect(tiendas).toHaveLength(listaTiendas.length);
  });

  it('findOne debe retornar una tienda por id', async () => {
    const tiendaAlmacenada: TiendaEntity = listaTiendas[0];
    const tienda: TiendaEntity = await service.findOne(tiendaAlmacenada.id);
    expect(tienda).not.toBeNull();
    expect(tienda.nombre).toEqual(tiendaAlmacenada.nombre);
    expect(tienda.ciudad).toEqual(tiendaAlmacenada.ciudad);
    expect(tienda.direccion).toEqual(tiendaAlmacenada.direccion);
  });

  it('findOne debe lanzar un excepcion para una tienda invalida', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.")
  });

  it('create debe retornar una nueva tienda', async () => {
    const tienda: TiendaEntity = {
      id: "",
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.location.streetAddress(),
      productos: null
    }

    const nuevaTienda: TiendaEntity = await service.create(tienda);
    expect(nuevaTienda).not.toBeNull();

    const tiendaAlmacenada: TiendaEntity = await repository.findOne({ where: { id: nuevaTienda.id } })
    expect(tiendaAlmacenada).not.toBeNull();
    expect(tiendaAlmacenada.nombre).toEqual(nuevaTienda.nombre)
    expect(tiendaAlmacenada.ciudad).toEqual(nuevaTienda.ciudad)
    expect(tiendaAlmacenada.direccion).toEqual(nuevaTienda.direccion)
  });

  it('create debe retornar una excepcion que indica que la ciudad no es correcta', async () => {
    const tienda: TiendaEntity = {
      id: "",
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-2'),
      direccion: faker.location.streetAddress(),
      productos: null
    }

    await expect(() => service.create(tienda)).rejects.toHaveProperty("message", "La ciudad de la tienda debe ser un código de tres caracteres (e.g., SMR, BOG, MED).")
  });

  it('update debe modificar una tienda', async () => {
    const tienda: TiendaEntity = listaTiendas[0];
    tienda.nombre = faker.company.name();
    tienda.ciudad = faker.location.countryCode('alpha-3');
    tienda.direccion = faker.location.streetAddress();
    const tiendaActualizada: TiendaEntity = await service.update(tienda.id, tienda);
    expect(tiendaActualizada).not.toBeNull();
    const tiendaAlmacenada: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(tiendaAlmacenada).not.toBeNull();
    expect(tiendaAlmacenada.nombre).toEqual(tienda.nombre);
    expect(tiendaAlmacenada.ciudad).toEqual(tienda.ciudad);
    expect(tiendaAlmacenada.direccion).toEqual(tienda.direccion);
  });

  it('update debe retornar una excepcion que indica que la ciudad no es correcta', async () => {
    const tienda: TiendaEntity = listaTiendas[0];
    tienda.nombre = faker.company.name();
    tienda.ciudad = faker.location.countryCode('alpha-2');
    tienda.direccion = faker.location.streetAddress();
    await expect(() => service.update(tienda.id, tienda)).rejects.toHaveProperty("message", "La ciudad de la tienda que intenta actualizar debe ser un código de tres caracteres (e.g., SMR, BOG, MED).")
  });

  it('update debe retornar una excepcion por una tienda invalido', async () => {
    let tienda: TiendaEntity = listaTiendas[0];
    tienda = {
      ...tienda, nombre: faker.company.name(), ciudad: faker.location.countryCode('alpha-3'), direccion: faker.location.streetAddress(),
    }
    await expect(() => service.update("0", tienda)).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.")
  });

  it('delete debe eliminar una tienda ', async () => {
    const tienda: TiendaEntity = listaTiendas[0];
    await service.delete(tienda.id);
     const tiendaEliminada: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(tiendaEliminada).toBeNull();
  });

  it('delete debe retornar una excepcion por tienda invalida', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró una tienda con el id proporcionado.")
  });
});
