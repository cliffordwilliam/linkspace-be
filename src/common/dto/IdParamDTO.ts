import { IsUUID } from "class-validator";
import { BaseDTO } from "@/common/dto/BaseDTO";

export class IdParamDTO extends BaseDTO {
  @IsUUID()
  id!: string;
}
