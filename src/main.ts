import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from 'nestjs-pino';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  let app;

  // Setup HTTPS if enabled
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  if (httpsEnabled) {
    const certPath = process.env.SSL_CERT_PATH || './certs/certificate.pem';
    const keyPath = process.env.SSL_KEY_PATH || './certs/private-key.pem';

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
      app = await NestFactory.create(AppModule, {
        httpsOptions,
        bufferLogs: true,
      });
    } else {
      console.warn(`SSL certificates not found at ${certPath} and ${keyPath}. Running in HTTP mode.`);
      app = await NestFactory.create(AppModule, { bufferLogs: true });
    }
  } else {
    app = await NestFactory.create(AppModule, { bufferLogs: true });
  }
  // app.useLogger(app.get(Logger)); // Commented out - LoggerModule not configured

  // Global prefix for APIs
  app.setGlobalPrefix('v1');

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      disableErrorMessages: process.env.NODE_ENV === 'production', // Disable detailed error messages in production
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Security headers
  app.use(helmet());

  // Response compression
  app.use(compression());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Music Bands API')
    .setDescription('API for managing music bands, albums, songs, and members')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Authentication', 'User authentication and registration')
    .addTag('Bands', 'Band management operations')
    .addTag('Albums', 'Album management operations')
    .addTag('Songs', 'Song management operations')
    .addTag('Members', 'Member management operations')
    .build();
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  const protocol = httpsEnabled ? 'https' : 'http';
  console.log(`Application is running on: ${protocol}://localhost:${port}`);
  console.log(`Swagger documentation: ${protocol}://localhost:${port}/api`);
}
bootstrap();
