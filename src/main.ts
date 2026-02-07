import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { AllExceptionsFilter } from './core/services/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // or '*' for all origins in dev
    credentials: true,
  });

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000)
}
bootstrap();
