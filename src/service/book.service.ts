import { environmentConfig } from "@/config/environment.config.js";
import type {
  GetBookDetailResponse,
  GetBooksQueryDto,
  SearchBookResponse,
} from "@/dto/book.dto.js";
import {
  toBookDetailResponse,
  toBookResponseList,
} from "@/helper/book.helper.js";
import type { ApiResponse, PageData } from "@/model/apiReponse.js";
import ApiError from "@/util/api-error.util.js";
import { StatusCodes } from "http-status-codes";
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
  getBookDetail = async (
    workId: string,
  ): Promise<ApiResponse<GetBookDetailResponse>> => {
    const cleanWorkId = workId.replace("/works/", "").trim();

    const [workRes, editionsRes] = await Promise.all([
      fetch(
        `${environmentConfig.openLibrary.baseUrl}/works/${cleanWorkId}.json`,
        {
          headers: {
            "User-Agent": "ReadingTrackerApp/1.0 (your-email@example.com)",
          },
        },
      ),
      fetch(
        `${environmentConfig.openLibrary.baseUrl}/works/${cleanWorkId}/editions.json?limit=1`,
        {
          headers: {
            "User-Agent": "ReadingTrackerApp/1.0 (your-email@example.com)",
          },
        },
      ),
    ]);

    if (!workRes.ok) {
      if (workRes.status === StatusCodes.NOT_FOUND) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Không tìm thấy tác phẩm này",
        );
      }
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        "Lỗi khi lấy dữ liệu từ thư viện OpenLibrary",
      );
    }

    const workData = await workRes.json();
    const editionsData = editionsRes.ok ? await editionsRes.json() : null;

    const primaryEdition = editionsData?.entries?.[0] || {};

    const authorNames: string[] = [];
    const authorRefs = workData.authors || primaryEdition.authors || [];

    if (Array.isArray(authorRefs) && authorRefs.length > 0) {
      const authorPromises = authorRefs.map(async (ref: any) => {
        const authorKey = ref.author?.key || ref.key;
        if (!authorKey) return null;

        try {
          const res = await fetch(
            `${environmentConfig.openLibrary.baseUrl}${authorKey}.json`,
            {
              headers: {
                "User-Agent": "ReadingTrackerApp/1.0 (your-email@example.com)",
              },
            },
          );
          if (res.ok) {
            const authorData = await res.json();
            return authorData.name as string;
          }
        } catch (e) {
          console.error(`Lỗi fetch author ${authorKey}:`, e);
        }
        return null;
      });

      const resolvedAuthors = await Promise.all(authorPromises);
      resolvedAuthors.forEach((name) => {
        if (name) authorNames.push(name);
      });
    }

    const bookDetail: GetBookDetailResponse = toBookDetailResponse(
      cleanWorkId,
      workData,
      primaryEdition,
      authorNames,
    );

    return {
      status: StatusCodes.OK,
      message: "Chi tiết tác phẩm",
      data: bookDetail,
    };
  };
}
