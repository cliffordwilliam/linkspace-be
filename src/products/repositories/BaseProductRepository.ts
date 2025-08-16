import { ProductModel } from "../models/ProductModel";

/**
 * Base repository interface for Product operations.
 */
export abstract class BaseProductRepository {
  /**
   * Create a new product.
   * @param product Product data to create.
   * @returns The newly created product.
   */
  abstract create(product: ProductModel): Promise<ProductModel>;

  /**
   * Retrieve a product by its ID.
   * @param productId The ID of the product to retrieve.
   * @returns The product or null if not found.
   */
  abstract getById(productId: string): Promise<ProductModel | null>;

  /**
   * Update an existing product.
   * @param updatedProduct Product data to update.
   * @returns The updated product.
   */
  abstract update(updatedProduct: ProductModel): Promise<ProductModel>;

  /**
   * List all products.
   * @returns List of all products.
   */
  abstract listAll(): Promise<ProductModel[]>;
}
