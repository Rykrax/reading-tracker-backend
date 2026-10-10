import ApiError from "@/util/api-error.util.js";
import type { Request, Response, NextFunction } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let status: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message: string = "Đã xảy ra lỗi phía máy chủ";

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
  }

  res.status(status).json({
    status,
    error: getReasonPhrase(status),
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
