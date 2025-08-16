import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
} from "class-validator";

// --- Base DTO ---
export class ProductBaseDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  product_name!: string;

  @IsOptional()
  @IsBoolean()
  deleted_status?: boolean = false;
}

// --- Create DTO ---
export class ProductCreateDTO extends ProductBaseDTO {}

// --- Update DTO ---
export class ProductUpdateDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  product_name?: string;

  @IsOptional()
  @IsBoolean()
  deleted_status?: boolean;
}

// --- Response DTO ---
export class ProductDTO extends ProductBaseDTO {
  @IsUUID()
  product_id!: string;

  date_created!: Date;
  date_modified!: Date;
}
