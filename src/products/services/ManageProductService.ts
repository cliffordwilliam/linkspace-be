import { ProductModel } from "../models/ProductModel";
import { BaseProductRepository } from "../repositories/BaseProductRepository";
import { TypeOrmProductRepository } from "../repositories/TypeOrmProductRepository";
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductDTO,
} from "../schemas/ProductDTO";
import { DataSource } from "typeorm";
import { ResourceNotFoundException } from "@/api/models/ResourceNotFoundException";

export class ManageProductService {
  private repo: BaseProductRepository;

  constructor(dataSource: DataSource) {
    this.repo = new TypeOrmProductRepository(dataSource);
  }

  private _toDTO(product: ProductModel): ProductDTO {
    return {
      product_id: product.product_id,
      product_name: product.product_name,
      deleted_status: product.deleted_status,
      date_created: product.date_created,
      date_modified: product.date_modified,
    };
  }

  async create(productData: ProductCreateDTO): Promise<ProductDTO> {
    const product = new ProductModel();
    product.product_name = productData.product_name;
    product.deleted_status = productData.deleted_status ?? false;

    const createdProduct = await this.repo.create(product);
    return this._toDTO(createdProduct);
  }

  async getById(productId: string): Promise<ProductDTO | null> {
    const product = await this.repo.getById(productId);
    if (!product)
      throw new ResourceNotFoundException(
        `Product with id ${productId} not found`,
      );
    return this._toDTO(product);
  }

  async update(
    productId: string,
    updates: ProductUpdateDTO,
  ): Promise<ProductDTO | null> {
    const existingProduct = await this.repo.getById(productId);
    if (!existingProduct)
      throw new ResourceNotFoundException(
        `Product with id ${productId} not found`,
      );

    if (updates.product_name !== undefined)
      existingProduct.product_name = updates.product_name;
    if (updates.deleted_status !== undefined)
      existingProduct.deleted_status = updates.deleted_status;

    const updatedProduct = await this.repo.update(existingProduct);
    return this._toDTO(updatedProduct);
  }

  async listAll(): Promise<ProductDTO[]> {
    const products = await this.repo.listAll();
    return products.map((p) => this._toDTO(p));
  }
}
