import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const options = new DocumentBuilder()
    .setTitle('ZA Lambda Core Service')
    .setDescription('Zummit Africa Lambda Core Service')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-zapi-auth-token',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Zapi Access Token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(Number(process.env.NODE_PORT) || 3000);
}
bootstrap();
