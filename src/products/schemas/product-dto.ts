import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
} from "class-validator";
import { Expose } from "class-transformer";
import { BaseDTO } from "@/common/dto/base-dto";

// --- Base DTO ---
export class ProductBaseDTO extends BaseDTO {
  @Expose()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  product_name!: string;

  @Expose()
  @IsBoolean()
  deleted_status!: boolean;
}

// --- Create DTO ---
export class ProductCreateDTO extends BaseDTO {
  @Expose()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  product_name!: string;
}

// --- Update DTO ---
export class ProductUpdateDTO extends BaseDTO {
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  product_name?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  deleted_status?: boolean;
}

// --- Response DTO ---
export class ProductDTO extends ProductBaseDTO {
  @Expose()
  @IsUUID()
  product_id!: string;

  @Expose()
  date_created!: Date;

  @Expose()
  date_modified!: Date;
}
