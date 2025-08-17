import { Brackets, DataSource } from "typeorm";
import { ProductModel } from "@/products/models/product-model";
import { BaseProductRepository } from "@/products/repositories/base-product-repository";
import { ProductListFiltersDTO } from "@/products/schemas/product-filters-dto";
import { PaginatedResponse } from "@/common/dto/paginated-response";

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

  async listAll(
    filters: ProductListFiltersDTO,
  ): Promise<PaginatedResponse<ProductModel>> {
    const { page, page_size, mode } = filters;

    const repo = this.dataSource.getRepository(ProductModel);
    const qb = repo.createQueryBuilder("product");

    const { conditions, params } = this._buildFiltersList(filters);

    if (conditions.length) {
      if (mode === "OR") {
        qb.where(
          new Brackets((qbInner) => {
            conditions.forEach((cond, idx) => {
              if (idx === 0) qbInner.where(cond, params);
              else qbInner.orWhere(cond, params);
            });
          }),
        );
      } else {
        conditions.forEach((cond, idx) => {
          if (idx === 0) qb.where(cond, params);
          else qb.andWhere(cond, params);
        });
      }
    }

    const total_count = await qb.getCount();
    const offset = (page - 1) * page_size;

    const data = await qb.skip(offset).take(page_size).getMany();
    const total_pages = Math.ceil(total_count / page_size);

    return {
      data,
      meta: {
        page,
        page_size,
        total_count,
        total_pages,
        has_next: page < total_pages,
        has_previous: page > 1,
      },
    };
  }

  private _buildFiltersList(filters: ProductListFiltersDTO): {
    conditions: string[];
    params: Partial<ProductListFiltersDTO>;
  } {
    const conditions: string[] = [];
    const params: Partial<ProductListFiltersDTO> = {};

    if (filters.product_name) {
      conditions.push("product.product_name ILIKE :product_name");
      params.product_name = `%${filters.product_name}%`;
    }

    if (filters.deleted_status !== undefined) {
      conditions.push("product.deleted_status = :deleted_status");
      params.deleted_status = filters.deleted_status;
    }

    return { conditions, params };
  }
}
