import { DataSource } from "typeorm";
import { ProductModel } from "@/products/models/ProductModel";
import { BaseProductRepository } from "@/products/repositories/BaseProductRepository";

export class TypeOrmProductRepository extends BaseProductRepository {
  constructor(private dataSource: DataSource) {
    super();
  }

  async create(product: ProductModel): Promise<ProductModel> {
    return this.dataSource.getRepository(ProductModel).save(product);
  }

  async getById(productId: string): Promise<ProductModel | null> {
    return this.dataSource
      .getRepository(ProductModel)
      .findOneBy({ product_id: productId });
  }

  async update(updatedProduct: ProductModel): Promise<ProductModel> {
    await this.dataSource
      .getRepository(ProductModel)
      .update({ product_id: updatedProduct.product_id }, updatedProduct);
    return this.getById(updatedProduct.product_id) as Promise<ProductModel>;
  }

  async listAll(): Promise<ProductModel[]> {
    return this.dataSource.getRepository(ProductModel).find();
  }
}
