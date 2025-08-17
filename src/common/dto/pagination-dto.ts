import { IsInt, Min, IsIn } from "class-validator";
import { Type } from "class-transformer";
import { BaseDTO } from "@/common/dto/base-dto";

export class PaginationDTO extends BaseDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page_size = 10;

  @IsIn(["AND", "OR"])
  mode: "AND" | "OR" = "AND";
}
