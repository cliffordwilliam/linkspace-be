import { IsUUID } from "class-validator";
import { BaseDTO } from "@/common/dto/base-dto";

export class IdParamDTO extends BaseDTO {
  @IsUUID()
  id!: string;
}
