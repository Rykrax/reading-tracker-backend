import { PAGING } from "@/constant/paging.constant.js";

export function toInt(value: any): number {
  const num = Number(value);
  return Number.isInteger(num) ? num : NaN;
}

export function normalizedPage(page: any): number {
  if (page == null || page == undefined) return 1;
  var iPage = toInt(page.toString());
  if (Number.isNaN(iPage) || iPage < 0) return 1;
  return iPage;
}

export function normalizedLimit(litmit: any): number {
  if (litmit == null || litmit == undefined) return PAGING.DEFAULT_PAGE_LIMIT;
  var iPageLimit = toInt(litmit.toString());
  if (
    Number.isNaN(iPageLimit) ||
    !PAGING.PAGE_LIMIT_OPTIONS.some((f) => f == iPageLimit)
  )
    return PAGING.DEFAULT_PAGE_LIMIT;
  return iPageLimit;
}

export function normalizedOffset(page: number, pageSize: number): number {
  if (page < 0) return 0;
  return (page - 1) * pageSize;
}
