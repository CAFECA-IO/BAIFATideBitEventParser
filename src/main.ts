import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const API_PORT = process.env.API_PORT || 3000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(+API_PORT);
    console.log(`Application is running on: ${await app.getUrl()}`);
  }
  
bootstrap();

