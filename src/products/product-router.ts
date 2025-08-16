import { Router, Request, Response } from "express";
import { AppDataSource } from "@/core/database/typeorm";
import { ManageProductService } from "@/products/services/ManageProductService";
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductDTO,
} from "@/products/schemas/ProductDTO";
import { HTTP_STATUS } from "@/constants/http";

export const productRouter = Router();
const service = new ManageProductService(AppDataSource);

productRouter.post("/", async (req: Request, res: Response) => {
  const productData: ProductCreateDTO = req.body;
  const createdProduct: ProductDTO = await service.create(productData);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: createdProduct,
    meta: {},
  });
});

productRouter.get("/", async (_req: Request, res: Response) => {
  const products: ProductDTO[] = await service.listAll();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: products,
    meta: {},
  });
});

productRouter.get("/:productId", async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const product: ProductDTO | null = await service.getById(productId);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: product,
    meta: {},
  });
});

productRouter.put("/:productId", async (req: Request, res: Response) => {
  const productId = req.params.productId;
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
});
