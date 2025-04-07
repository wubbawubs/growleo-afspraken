import { Request } from 'express';

export interface RequestWithParams extends Request {
  params: {
    id: string;
  };
}

export interface RequestWithBody<T> extends Request {
  body: T;
}

export interface RequestWithParamsAndBody<T> extends RequestWithParams {
  body: T;
}

export interface RequestWithQuery<T extends Record<string, any>> extends Request {
  query: T;
} 