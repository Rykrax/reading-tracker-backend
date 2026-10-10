import type { BookService } from "@/service/book.service.js";
import { inject, injectable } from "tsyringe";
import { TYPES } from "@/di/types.di.js";
import type { Request, Response } from "express";
import { normalizedLimit, normalizedPage } from "@/util/other.util.js";
import type { GetBooksQueryDto } from "@/dto/book.dto.js";

@injectable()
export class BookController {
  constructor(
    @inject(TYPES.BookService) private readonly bookService: BookService,
  ) {}

  public getBooks = async (req: Request, res: Response): Promise<void> => {
    const query: GetBooksQueryDto = {
      q: req.query.q as string,
      page: normalizedPage(req.query.page),
      limit: normalizedLimit(req.query.limit),
    };
    const result = await this.bookService.getBooks(query);
    res.json(result);
  };

  public getBookDetail = async (
    req: Request<{ workId: string }>,
    res: Response,
  ): Promise<void> => {
    const { workId } = req.params;
    const result = await this.bookService.getBookDetail(workId);
    res.json(result);
  };
}
