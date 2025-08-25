import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RiskService } from './risk.service';

@ApiTags('risk')
@Controller('risk')
@UseGuards(JwtAuthGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('strategies/:id/risk')
  @ApiOperation({ summary: 'Calculate risk metrics for strategy' })
  @ApiResponse({ status: 200, description: 'Risk metrics calculated successfully' })
  async calculateRisk(@Param('id') id: string) {
    return this.riskService.calculateRisk(id);
  }
}
