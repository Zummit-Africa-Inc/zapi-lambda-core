import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * It creates a microservice that listens to a RabbitMQ queue and uses the AppModule to handle incoming messages
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue:
          process.env.NODE_ENV !== 'production'
            ? process.env.DEV_ANALYTICS_QUEUE
            : process.env.ANALYTICS_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  app.listen();
}
bootstrap();
