import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";
import {
  parseOptionalInt,
  parseOptionalNumber,
  parseOptionalString,
} from "../utils/parsers";
import * as productsService from "../services/productsService";

export async function listProducts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products = await productsService.listProducts();
    res.json({ data: products });
  } catch (error) {
    next(error as Error);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid product id");
    }
    const product = await productsService.getProductById(id);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    res.json({ data: product });
  } catch (error) {
    next(error as Error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const name = parseOptionalString(req.body.name);
    const price = parseOptionalNumber(req.body.price);
    const stock = parseOptionalInt(req.body.stock);
    const imageFromBody = parseOptionalString(req.body.image);
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : imageFromBody;

    if (!name) {
      throw new HttpError(400, "Product name is required");
    }
    if (price === undefined || price === null) {
      throw new HttpError(400, "Product price must be a number");
    }
    if (price < 0) {
      throw new HttpError(400, "Product price must be zero or higher");
    }
    if (stock === undefined || stock === null) {
      throw new HttpError(400, "Product stock must be an integer");
    }
    if (stock < 0) {
      throw new HttpError(400, "Product stock must be zero or higher");
    }

    const product = await productsService.createProduct({
      name,
      image: imagePath ?? null,
      price,
      stock,
    });

    res.status(201).json({ data: product });
  } catch (error) {
    next(error as Error);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid product id");
    }

    const name = parseOptionalString(req.body.name);
    const price = parseOptionalNumber(req.body.price);
    const stock = parseOptionalInt(req.body.stock);
    const imageFromBody = parseOptionalString(req.body.image);
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : imageFromBody;

    if (price === null) {
      throw new HttpError(400, "Product price must be a number");
    }
    if (price !== undefined && price < 0) {
      throw new HttpError(400, "Product price must be zero or higher");
    }
    if (stock === null) {
      throw new HttpError(400, "Product stock must be an integer");
    }
    if (stock !== undefined && stock < 0) {
      throw new HttpError(400, "Product stock must be zero or higher");
    }

    if (
      name === undefined &&
      price === undefined &&
      stock === undefined &&
      imagePath === undefined
    ) {
      throw new HttpError(400, "No changes provided");
    }

    const product = await productsService.updateProduct(id, {
      name: name ?? null,
      image: imagePath ?? null,
      price: price ?? null,
      stock: stock ?? null,
    });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    res.json({ data: product });
  } catch (error) {
    next(error as Error);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid product id");
    }
    const removed = await productsService.deleteProduct(id);
    if (!removed) {
      throw new HttpError(404, "Product not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
}
