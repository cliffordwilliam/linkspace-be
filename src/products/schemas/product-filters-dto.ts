import { IsOptional, IsString } from "class-validator";
import { ToBoolean } from "@/common/transformers/boolean-transformer";
import { PaginationDTO } from "@/common/dto/pagination-dto";

export class ProductListFiltersDTO extends PaginationDTO {
  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @ToBoolean()
  deleted_status?: boolean;
}
