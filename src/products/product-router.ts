import { Router, Request, Response } from "express";
import { AppDataSource } from "@/core/database/typeorm";
import { ManageProductService } from "@/products/services/ManageProductService";
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductDTO,
} from "@/products/schemas/ProductDTO";

export const productRouter = Router();
const service = new ManageProductService(AppDataSource);

// Create product
productRouter.post("/", async (req: Request, res: Response) => {
  try {
    const productData: ProductCreateDTO = req.body;
    const createdProduct: ProductDTO = await service.create(productData);
    res.status(201).json({ data: createdProduct });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// List all products
productRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const products: ProductDTO[] = await service.listAll();
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get product by ID
productRouter.get("/:productId", async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const product: ProductDTO | null = await service.getById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Update product by ID
productRouter.put("/:productId", async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const updates: ProductUpdateDTO = req.body;
    const updatedProduct: ProductDTO | null = await service.update(
      productId,
      updates,
    );
    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ data: updatedProduct });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
