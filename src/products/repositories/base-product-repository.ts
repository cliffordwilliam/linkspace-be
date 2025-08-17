import { ProductModel } from "@/products/models/product-model";
import { PaginatedResponse } from "@/common/dto/paginated-response";
import { ProductListFiltersDTO } from "@/products/schemas/product-filters-dto";

export abstract class BaseProductRepository {
  abstract create(product: ProductModel): Promise<ProductModel>;

  abstract getById(productId: string): Promise<ProductModel | null>;

  abstract update(updatedProduct: ProductModel): Promise<ProductModel>;

  abstract listAll(
    filters: ProductListFiltersDTO,
  ): Promise<PaginatedResponse<ProductModel>>;
}
