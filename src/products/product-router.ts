import { Router, Request, Response } from "express";
import { AppDataSource } from "@/core/database/typeorm";
import { ManageProductService } from "@/products/services/ManageProductService";
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductDTO,
} from "@/products/schemas/ProductDTO";
import { HTTP_STATUS } from "@/common/constants/http";
import { validateDTO } from "@/core/middlewares/validate-dto";
import { REQUEST_SOURCE } from "@/common/constants/request-source";
import { IdParamDTO } from "@/common/dto/IdParamDTO";

export const productRouter = Router();
const service = new ManageProductService(AppDataSource);

productRouter.post(
  "",
  validateDTO(ProductCreateDTO, REQUEST_SOURCE.BODY),
  async (req: Request, res: Response) => {
    const productData: ProductCreateDTO = req.body;
    const createdProduct: ProductDTO = await service.create(productData);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: createdProduct,
      meta: {},
    });
  },
);

productRouter.get("", async (_req: Request, res: Response) => {
  const products: ProductDTO[] = await service.listAll();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: products,
    meta: {},
  });
});

productRouter.get(
  "/:id",
  validateDTO(IdParamDTO, REQUEST_SOURCE.PARAMS),
  async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product: ProductDTO | null = await service.getById(productId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: product,
      meta: {},
    });
  },
);

productRouter.put(
  "/:id",
  validateDTO(IdParamDTO, REQUEST_SOURCE.PARAMS),
  validateDTO(ProductUpdateDTO, REQUEST_SOURCE.BODY),
  async (req: Request, res: Response) => {
    const productId = req.params.id;
    const updates: ProductUpdateDTO = req.body;
    const updatedProduct: ProductDTO | null = await service.update(
      productId,
      updates,
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: updatedProduct,
      meta: {},
    });
  },
);
