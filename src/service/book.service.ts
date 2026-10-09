import { environmentConfig } from "@/config/environment.config.js";
import type { GetBooksQueryDto } from "@/dto/book.dto.js";
import type { SearchBookResponse } from "@/dto/searchBookResponse.js";
import { toBookResponseList } from "@/helper/book.helper.js";
import type { ApiResponse, PageData } from "@/model/apiReponse.js";
import { injectable } from "tsyringe";

@injectable()
export class BookService {
  async getBooks(
    query: GetBooksQueryDto,
  ): Promise<ApiResponse<PageData<SearchBookResponse>>> {
    const { q, page = 1, limit = 10 } = query;

    const searchParams = new URLSearchParams();

    const queryTerm = q?.trim() || "programming";
    searchParams.append("q", queryTerm);

    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const response = await fetch(
      `${environmentConfig.openLibrary.baseUrl}/search.json?${searchParams.toString()}`,
    );

    const rawData = await response.json();

    const bookList: SearchBookResponse[] = toBookResponseList(rawData.docs);
    const totalItems = rawData.numFound ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    const pageData: PageData<SearchBookResponse> = {
      items: bookList,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      status: 200,
      message: "Danh sách Sách",
      data: pageData,
    };
  }
}
