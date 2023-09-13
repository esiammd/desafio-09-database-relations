import { uuid } from 'uuidv4';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import IOrdersRepository from '../IOrdersRepository';

class FakeOrdersRepository implements IOrdersRepository {
  private readonly orders: Order[] = [];

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = new Order();

    Object.assign(order, { id: uuid(), customer, order_products: products });

    this.orders.push(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const findOrder = this.orders.find(order => order.id === id);

    return findOrder !== undefined ? findOrder : undefined;
  }
}

export default FakeOrdersRepository;
