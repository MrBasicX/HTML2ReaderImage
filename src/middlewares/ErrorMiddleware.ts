import { Request, Response, NextFunction } from "express";
import path from "path";


const notFound = async (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error Handling", err)

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.sendFile('error-chan.png', { root: path.join(__dirname, '../../public') });
};

export { notFound, errorHandler };
