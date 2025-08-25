import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UniversesModule } from './universes/universes.module';
import { StrategiesModule } from './strategies/strategies.module';
import { RiskModule } from './risk/risk.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UniversesModule,
    StrategiesModule,
    RiskModule,
    ComplianceModule,
    ExportsModule,
  ],
})
export class AppModule {}
