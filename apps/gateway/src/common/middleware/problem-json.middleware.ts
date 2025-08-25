import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProblemJsonMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Override the error handling to return Problem+JSON format
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Set the Problem+JSON content type
      res.setHeader('Content-Type', 'application/problem+json');
      
      return originalJson.call(this, data);
    };

    // Override error handling
    const originalStatus = res.status;
    res.status = function(code: number) {
      if (code >= 400) {
        // Format error responses as Problem+JSON
        const problem = {
          type: this.getProblemType(code),
          title: this.getProblemTitle(code),
          status: code,
          detail: data?.message || 'An error occurred',
          instance: req.url,
          timestamp: new Date().toISOString(),
        };
        
        res.setHeader('Content-Type', 'application/problem+json');
        return originalStatus.call(this, code).json(problem);
      }
      
      return originalStatus.call(this, code);
    }.bind(this);

    next();
  }

  private getProblemType(statusCode: number): string {
    const baseUrl = 'https://api.tradingfloor.com/problems';
    
    switch (statusCode) {
      case 400: return `${baseUrl}/bad-request`;
      case 401: return `${baseUrl}/unauthorized`;
      case 403: return `${baseUrl}/forbidden`;
      case 404: return `${baseUrl}/not-found`;
      case 409: return `${baseUrl}/conflict`;
      case 422: return `${baseUrl}/unprocessable-entity`;
      case 429: return `${baseUrl}/too-many-requests`;
      case 500: return `${baseUrl}/internal-server-error`;
      default: return `${baseUrl}/unknown-error`;
    }
  }

  private getProblemTitle(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 409: return 'Conflict';
      case 422: return 'Unprocessable Entity';
      case 429: return 'Too Many Requests';
      case 500: return 'Internal Server Error';
      default: return 'Unknown Error';
    }
  }
}
