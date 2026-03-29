import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  const nets = networkInterfaces();
  const localIp = Object.values(nets).flat().find(n => n && n.family === 'IPv4' && !n.internal)?.address;
  console.log(`  Local:   http://localhost:${port}`);
  console.log(`  Network: http://${localIp}:${port}`);
}
bootstrap();
