import { uuid } from 'uuidv4';

import Product from '@modules/products/infra/typeorm/entities/Product';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import IProductsRepository from '../IProductsRepository';

interface IFindProducts {
  id: string;
}

class FakeProductsRepository implements IProductsRepository {
  private readonly products: Product[] = [];

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = new Product();

    Object.assign(product, { id: uuid(), name, price, quantity });

    this.products.push(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = this.products.find(product => product.name === name);

    return findProduct !== undefined ? findProduct : undefined;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products.map(product => product.id);

    const findProducts = this.products.filter(product =>
      productsIds.includes(product.id),
    );

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    products.map(product => {
      const findIndex = this.products.findIndex(
        findProduct => findProduct.id === product.id,
      );

      this.products[findIndex].quantity = product.quantity;

      return product;
    });

    return this.products;
  }
}

export default FakeProductsRepository;
