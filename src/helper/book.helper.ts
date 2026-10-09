import { environmentConfig } from "@/config/environment.config.js";
import type {
  OpenLibraryDoc,
  SearchBookResponse,
} from "@/dto/searchBookResponse.js";

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
