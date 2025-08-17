import { ProductModel } from "@/products/models/product-model";
import { BaseProductRepository } from "@/products/repositories/base-product-repository";
import { TypeOrmProductRepository } from "@/products/repositories/typeorm-product-repository";
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductDTO,
} from "@/products/schemas/product-dto";
import { DataSource } from "typeorm";
import { ResourceNotFoundException } from "@/api/errors/resource-not-found-exception";
import { plainToInstance, instanceToPlain } from "class-transformer";

export class ManageProductService {
  private repo: BaseProductRepository;

  constructor(dataSource: DataSource) {
    this.repo = new TypeOrmProductRepository(dataSource);
  }

  async create(productData: ProductCreateDTO): Promise<ProductDTO> {
    const product = plainToInstance(ProductModel, productData);
    const createdProduct = await this.repo.create(product);
    return plainToInstance(ProductDTO, createdProduct, {
      excludeExtraneousValues: true,
    });
  }

  async getById(productId: string): Promise<ProductDTO> {
    const product = await this.repo.getById(productId);
    if (!product)
      throw new ResourceNotFoundException(
        `Product with id ${productId} not found`,
      );
    return plainToInstance(ProductDTO, product, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    productId: string,
    updates: ProductUpdateDTO,
  ): Promise<ProductDTO> {
    const existingProduct = await this.repo.getById(productId);
    if (!existingProduct)
      throw new ResourceNotFoundException(
        `Product with id ${productId} not found`,
      );

    const updatedEntity = plainToInstance(ProductModel, {
      ...instanceToPlain(existingProduct),
      ...updates,
    });

    const saved = await this.repo.update(updatedEntity);
    return plainToInstance(ProductDTO, saved, {
      excludeExtraneousValues: true,
    });
  }

  async listAll(): Promise<ProductDTO[]> {
    const products = await this.repo.listAll();
    return products.map((p) =>
      plainToInstance(ProductDTO, p, { excludeExtraneousValues: true }),
    );
  }
}
