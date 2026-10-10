import { environmentConfig } from "@/config/environment.config.js";
import type { GetBookDetail, GetBooksQueryDto } from "@/dto/book.dto.js";
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

  getBookDetail = async (
    workId: string,
  ): Promise<ApiResponse<GetBookDetail>> => {
    try {
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
        if (workRes.status === 404) {
          return {
            status: 404,
            message: "Không tìm thấy tác phẩm này",
          };
        }
        throw new Error(`OpenLibrary Work HTTP status: ${workRes.status}`);
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
                  "User-Agent":
                    "ReadingTrackerApp/1.0 (your-email@example.com)",
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

      const coverId = primaryEdition.covers?.[0] || workData.covers?.[0];
      const coverUrl = coverId
        ? `${environmentConfig.openLibrary.coverApiUrl}/b/id/${coverId}-L.jpg`
        : primaryEdition.key
          ? `${environmentConfig.openLibrary.coverApiUrl}/b/olid/${primaryEdition.key.replace("/books/", "")}-L.jpg`
          : null;

      let description = "Chưa có mô tả cho tác phẩm này.";
      const rawDesc = workData.description || primaryEdition.description;
      if (typeof rawDesc === "string") {
        description = rawDesc;
      } else if (rawDesc?.value) {
        description = rawDesc.value;
      }

      let pages: number | null = null;
      if (primaryEdition.number_of_pages) {
        pages = Number(primaryEdition.number_of_pages);
      } else if (primaryEdition.pagination) {
        const parsedPages = parseInt(primaryEdition.pagination, 10);
        if (!isNaN(parsedPages)) pages = parsedPages;
      }

      const bookDetail: GetBookDetail = {
        id: cleanWorkId,
        title: workData.title || primaryEdition.title || "Không có tiêu đề",
        subtitle: primaryEdition.subtitle || undefined,
        authors: authorNames.length > 0 ? authorNames : ["Unknown Author"],
        description,
        coverUrl,
        isbn:
          primaryEdition.isbn_13?.[0] || primaryEdition.isbn_10?.[0] || null,
        publisher: primaryEdition.publishers?.[0] || "N/A",
        publishDate: primaryEdition.publish_date || "N/A",
        pages,
        language:
          primaryEdition.languages?.[0]?.key?.replace("/languages/", "") ||
          "eng",
      };

      return {
        status: 200,
        message: "Lấy thông tin chi tiết thành công",
        data: bookDetail,
      };
    } catch (error: any) {
      console.error("Error in getBookDetail:", error.cause || error.message);
      return {
        status: 500,
        message: "Internal Server Error",
      };
    }
  };
}
