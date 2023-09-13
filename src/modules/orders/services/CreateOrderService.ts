import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if (customerExists === undefined) {
      throw new AppError('Customer not found.');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (findProducts.length === 0) {
      throw new AppError('Could not find any products with the give ids.');
    }

    const findProductsIds = findProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !findProductsIds.includes(product.id),
    );

    if (checkInexistentProducts.length > 0) {
      throw new AppError(
        `Could not find IDs: ${checkInexistentProducts
          .map(product => product.id)
          .join(', ')}.`,
      );
    }

    const findProductsWithNoQuantityAvailable = products.filter(
      product =>
        findProducts.filter(findProduct => findProduct.id === product.id)[0]
          .quantity < product.quantity,
    );

    if (findProductsWithNoQuantityAvailable.length > 0) {
      throw new AppError(
        `The quantity stated is not available for products: ${findProductsWithNoQuantityAvailable
          .map(findProduct => findProduct.id)
          .join(', ')}`,
      );
    }

    const formatedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: findProducts.filter(
        findProduct => findProduct.id === product.id,
      )[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: formatedProducts,
    });

    const { order_products } = order;

    const orderedProductsQuantity = order_products.map(order_product => ({
      id: order_product.product_id,
      quantity:
        findProducts.filter(
          findProduct => findProduct.id === order_product.product_id,
        )[0].quantity - order_product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
