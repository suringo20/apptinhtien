import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wrap an async route/middleware so a rejected promise is forwarded to
// Express' error handler instead of becoming an unhandled rejection.
export function ah(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
