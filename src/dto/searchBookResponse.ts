export interface SearchBookResponse {
  key: string;
  title: string;
  coverImage: string;
  author?: string[] | null;
  publishYear?: string | null;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_key?: string[];
  author_name?: string[];
  cover_edition_key?: string;
  cover_height?: number;
  cover_i?: number;
  cover_width?: number;
  ebook_access?: string;
  edition_count?: number;
  first_publish_year?: number;
  has_fulltext?: boolean;
  ia?: string[];
  ia_collection?: string[];
  language?: string[];
  lending_edition_s?: string;
  lending_identifier_s?: string;
  public_scan_b?: boolean;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  num_found: number;
  documentation_url: string;
  q: string;
  offset: number | null;
  docs: OpenLibraryDoc[];
}
