import { DataSource } from "typeorm";
import { ProductModel } from "@/products/models/product-model";
import { BaseProductRepository } from "@/products/repositories/base-product-repository";

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
    return this.dataSource.getRepository(ProductModel).save(updatedProduct);
  }

  async listAll(): Promise<ProductModel[]> {
    return this.dataSource.getRepository(ProductModel).find();
  }
}
