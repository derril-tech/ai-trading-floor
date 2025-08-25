import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportsService } from './exports.service';

@ApiTags('exports')
@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('strategies/:id/export')
  @ApiOperation({ summary: 'Export strategy reports' })
  @ApiResponse({ status: 200, description: 'Export initiated successfully' })
  async exportStrategy(@Param('id') id: string, @Body() exportRequest: any) {
    return this.exportsService.exportStrategy(id, exportRequest);
  }
}
