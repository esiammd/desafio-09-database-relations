import AppError from '@shared/errors/AppError';

import FakeProductsRepository from '../repositories/fakes/FakeProductsRepository';
import CreateProductService from './CreateProductService';

let fakeProductsRepository: FakeProductsRepository;
let createProduct: CreateProductService;

describe('CreateProduct', () => {
  beforeEach(() => {
    fakeProductsRepository = new FakeProductsRepository();

    createProduct = new CreateProductService(fakeProductsRepository);
  });

  it('should be able to create a new product', async () => {
    const product = await createProduct.execute({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    expect(product).toHaveProperty('id');
    expect(product.name).toBe('Soup');
    expect(product.price).toBe(10.99);
    expect(product.quantity).toBe(5);
  });

  it('should not be able to create a product with one name thats already registered', async () => {
    await createProduct.execute({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    await expect(
      createProduct.execute({
        name: 'Soup',
        price: 10.99,
        quantity: 5,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
