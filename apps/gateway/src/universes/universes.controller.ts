import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UniversesService } from './universes.service';

@ApiTags('universes')
@Controller('universes')
@UseGuards(JwtAuthGuard)
export class UniversesController {
  constructor(private readonly universesService: UniversesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new universe' })
  @ApiResponse({ status: 201, description: 'Universe created successfully' })
  async createUniverse(@Body() createUniverseDto: any) {
    return this.universesService.create(createUniverseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all universes' })
  @ApiResponse({ status: 200, description: 'Universes retrieved successfully' })
  async getUniverses() {
    return this.universesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get universe by ID' })
  @ApiResponse({ status: 200, description: 'Universe retrieved successfully' })
  async getUniverse(@Param('id') id: string) {
    return this.universesService.findOne(id);
  }
}
