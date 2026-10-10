class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
