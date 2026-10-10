import { environmentConfig } from "@/config/environment.config.js";
import type {
  GetBookDetail,
  OpenLibraryDoc,
  SearchBookResponse,
} from "@/dto/book.dto.js";

export const toBookResponse = (raw: OpenLibraryDoc): SearchBookResponse => {
  const result: SearchBookResponse = {
    key: raw.key.split("/").pop() ?? "",
    title: raw.title ?? "",
    coverImage: raw.cover_i
      ? `${environmentConfig.openLibrary.coverApiUrl}/b/id/${raw.cover_i}-M.jpg`
      : "",
  };

  if (raw.author_name && raw.author_name.length > 0) {
    result.author = raw.author_name;
  }

  if (raw.first_publish_year) {
    result.publishYear = raw.first_publish_year.toString();
  }

  return result;
};

export const toBookResponseList = (
  rawList?: OpenLibraryDoc[],
): SearchBookResponse[] => {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return [];
  }
  return rawList.map(toBookResponse);
};

export const toBookDetailResponse = (
  cleanWorkId: string,
  workData: any,
  primaryEdition: any,
  authorNames: string[],
): GetBookDetail => {
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

  return {
    id: cleanWorkId,
    title: workData.title || primaryEdition.title || "Không có tiêu đề",
    subtitle: primaryEdition.subtitle || undefined,
    authors: authorNames.length > 0 ? authorNames : ["Unknown Author"],
    description,
    coverUrl,
    isbn: primaryEdition.isbn_13?.[0] || primaryEdition.isbn_10?.[0] || null,
    publisher: primaryEdition.publishers?.[0] || "N/A",
    publishDate: primaryEdition.publish_date || "N/A",
    pages,
    language:
      primaryEdition.languages?.[0]?.key?.replace("/languages/", "") || "eng",
    subjects: Array.isArray(workData.subjects)
      ? workData.subjects.slice(0, 10)
      : [],
  };
};
