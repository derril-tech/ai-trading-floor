import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ComplianceService } from './compliance.service';

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('strategies/:id/pretrade')
  @ApiOperation({ summary: 'Run pre-trade compliance check' })
  @ApiResponse({ status: 200, description: 'Compliance check completed' })
  async pretradeCheck(@Param('id') id: string) {
    return this.complianceService.pretradeCheck(id);
  }
}
