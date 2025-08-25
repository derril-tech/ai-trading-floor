import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StrategiesService } from './strategies.service';

@ApiTags('strategies')
@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new strategy' })
  @ApiResponse({ status: 201, description: 'Strategy created successfully' })
  async createStrategy(@Body() createStrategyDto: any) {
    return this.strategiesService.create(createStrategyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all strategies' })
  @ApiResponse({ status: 200, description: 'Strategies retrieved successfully' })
  async getStrategies() {
    return this.strategiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get strategy by ID' })
  @ApiResponse({ status: 200, description: 'Strategy retrieved successfully' })
  async getStrategy(@Param('id') id: string) {
    return this.strategiesService.findOne(id);
  }
}
