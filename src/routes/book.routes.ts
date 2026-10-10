import { BookController } from "@/controller/book.controller.js";
import { Router } from "express";
import { container } from "tsyringe";
import { TYPES } from "@/di/types.di.js";

export const bookRoutes = Router();
const bookController = container.resolve<BookController>(TYPES.BookController);

bookRoutes.get("", bookController.getBooks);
bookRoutes.get("/:workId", bookController.getBookDetail);
