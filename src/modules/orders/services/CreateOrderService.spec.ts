import AppError from '@shared/errors/AppError';

import FakeProductsRepository from '@modules/products/repositories/fakes/FakeProductsRepository';
import FakeCustomersRepository from '@modules/customers/repositories/fakes/FakeCustomersRepository';
import FakeOrdersRepository from '../repositories/fakes/FakeOrdersRepository';
import CreateOrderService from './CreateOrderService';

let fakeOrdersRepository: FakeOrdersRepository;
let fakeProductsRepository: FakeProductsRepository;
let fakeCustomersRepository: FakeCustomersRepository;
let createOrder: CreateOrderService;

describe('CreateOrder', () => {
  beforeEach(() => {
    fakeOrdersRepository = new FakeOrdersRepository();
    fakeProductsRepository = new FakeProductsRepository();
    fakeCustomersRepository = new FakeCustomersRepository();

    createOrder = new CreateOrderService(
      fakeOrdersRepository,
      fakeProductsRepository,
      fakeCustomersRepository,
    );
  });

  it('should be able to create a new order', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    const product1 = await fakeProductsRepository.create({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    const product2 = await fakeProductsRepository.create({
      name: 'Bread',
      price: 5.99,
      quantity: 2,
    });

    const order = await createOrder.execute({
      customer_id: customer.id,
      products: [
        {
          id: product1.id,
          quantity: 2,
        },
        {
          id: product2.id,
          quantity: 1,
        },
      ],
    });

    expect(order).toHaveProperty('id');
    expect(order.customer.id).toBe(customer.id);
    expect(order.order_products.length).toBe(2);
    expect(order.order_products[0].product_id).toBe(product1.id);
    expect(order.order_products[1].product_id).toBe(product2.id);
  });

  it('should not be able to create an order with a invalid customer', async () => {
    const product = await fakeProductsRepository.create({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    await expect(
      createOrder.execute({
        customer_id: 'non-existing-customer-id',
        products: [
          {
            id: product.id,
            quantity: 2,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an order with invalid products', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    const product = await fakeProductsRepository.create({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    await expect(
      createOrder.execute({
        customer_id: customer.id,
        products: [
          {
            id: product.id,
            quantity: 2,
          },
          {
            id: 'non-existing-product-id',
            quantity: 2,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an order with products with insufficient quantities', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    const product = await fakeProductsRepository.create({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    await expect(
      createOrder.execute({
        customer_id: customer.id,
        products: [
          {
            id: product.id,
            quantity: 8,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to subtract an product total quantity when it is ordered', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    const product = await fakeProductsRepository.create({
      name: 'Soup',
      price: 10.99,
      quantity: 5,
    });

    await createOrder.execute({
      customer_id: customer.id,
      products: [
        {
          id: product.id,
          quantity: 2,
        },
      ],
    });

    expect(product.quantity).toBe(3);
  });
});
