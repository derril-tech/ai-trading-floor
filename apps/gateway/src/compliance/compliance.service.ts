import { Injectable } from '@nestjs/common';

@Injectable()
export class ComplianceService {
  async pretradeCheck(strategyId: string) {
    // TODO: Implement compliance check
    return {
      status: 'OK',
      reasons: ['All checks passed'],
      violations: [],
    };
  }
}
