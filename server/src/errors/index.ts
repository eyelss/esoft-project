class HttpError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public body: string[] = [],
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default HttpError;