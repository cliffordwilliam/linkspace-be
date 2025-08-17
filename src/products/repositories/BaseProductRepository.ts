import { ProductModel } from "@/products/models/ProductModel";

export abstract class BaseProductRepository {
  abstract create(product: ProductModel): Promise<ProductModel>;

  abstract getById(productId: string): Promise<ProductModel | null>;

  abstract update(updatedProduct: ProductModel): Promise<ProductModel>;

  abstract listAll(): Promise<ProductModel[]>;
}
