import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      return next();
    }

    // Only apply to mutation methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const cacheKey = `idempotency:${idempotencyKey}`;
    
    try {
      // Check if we've seen this key before
      const cachedResponse = await this.redisService.get(cacheKey);
      
      if (cachedResponse) {
        const response = JSON.parse(cachedResponse);
        
        // Return the cached response
        res.status(response.status).json(response.data);
        return;
      }

      // Store the original send method
      const originalSend = res.send;
      
      // Override the send method to cache the response
      res.send = function(data: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache successful responses for 24 hours
          this.redisService.setex(cacheKey, 86400, JSON.stringify({
            status: res.statusCode,
            data: JSON.parse(data)
          }));
        }
        
        return originalSend.call(this, data);
      }.bind(this);

      next();
    } catch (error) {
      throw new HttpException('Invalid idempotency key', HttpStatus.BAD_REQUEST);
    }
  }
}
