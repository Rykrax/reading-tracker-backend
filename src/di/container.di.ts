import { container } from "tsyringe";
import { BookController } from "@/controller/book.controller.js";
import { TYPES } from "./types.di.js";
import { BookService } from "@/service/book.service.js";

export async function initializeContainer(): Promise<void> {
  container.register(TYPES.BookController, {
    useFactory: (contai) =>
      new BookController(contai.resolve(TYPES.BookService)),
  });

  container.register(TYPES.BookService, {
    useFactory: () => new BookService(),
  });
}
