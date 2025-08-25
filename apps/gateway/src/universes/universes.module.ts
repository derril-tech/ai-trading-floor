import { Module } from '@nestjs/common';
import { UniversesController } from './universes.controller';
import { UniversesService } from './universes.service';

@Module({
  controllers: [UniversesController],
  providers: [UniversesService],
  exports: [UniversesService],
})
export class UniversesModule {}
