import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { config } from 'dotenv';
config({ path: './.env.example' });
ConfigModule.forRoot();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // logging: true,
  migrations: ['dist/src/database/migration/*.js'],
  synchronize: false,
});
