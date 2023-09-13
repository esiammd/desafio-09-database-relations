import AppError from '@shared/errors/AppError';

import FakeCustomersRepository from '@modules/customers/repositories/fakes/FakeCustomersRepository';
import FakeOrdersRepository from '../repositories/fakes/FakeOrdersRepository';
import FindOrderService from './FindOrderService';

let fakeOrdersRepository: FakeOrdersRepository;
let fakeCustomersRepository: FakeCustomersRepository;
let findOrder: FindOrderService;

describe('FindOrder', () => {
  beforeEach(() => {
    fakeOrdersRepository = new FakeOrdersRepository();
    fakeCustomersRepository = new FakeCustomersRepository();

    findOrder = new FindOrderService(fakeOrdersRepository);
  });

  it('should be able to list one specific order', async () => {
    const customer = await fakeCustomersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    const order = await fakeOrdersRepository.create({
      customer,
      products: [
        {
          product_id: 'product-id',
          price: 10.99,
          quantity: 2,
        },
      ],
    });

    const showOrder = await findOrder.execute({ id: order.id });

    expect(showOrder).toHaveProperty('id');
    expect(showOrder?.customer.id).toBe(customer.id);
    expect(showOrder?.order_products.length).toBe(1);
    expect(showOrder?.order_products[0].product_id).toBe('product-id');
  });

  it('it should not be possible to search for an invalid order', async () => {
    await expect(
      findOrder.execute({ id: 'non-existing-order-id' }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
