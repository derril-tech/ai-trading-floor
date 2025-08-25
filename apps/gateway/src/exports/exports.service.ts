import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportsService {
  async exportStrategy(strategyId: string, exportRequest: any) {
    // TODO: Implement export functionality
    return {
      id: 'export-1',
      status: 'pending',
      downloadUrl: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
  }
}
