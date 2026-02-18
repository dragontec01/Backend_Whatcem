import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationOptions } from '../types';

/**
 * Send a success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  options: PaginationOptions
): Response => {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  return res.status(200).json({
    success: true,
    ...response,
  });
};

/**
 * Parse pagination query parameters
 */
export const parsePagination = (query: {
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
}): PaginationOptions => {
  return {
    page: Math.max(1, parseInt(query.page || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(query.limit || '10', 10))),
    sort: query.sort || 'createdAt',
    order: (query.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
  };
};
