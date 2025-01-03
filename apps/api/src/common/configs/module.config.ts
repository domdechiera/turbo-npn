import { throttleConfig } from '@/common/configs/throttle.config';
import { Env } from '@/common/schemas/env.schema';
import { validateEnv } from '@/common/utils';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

export const moduleConfig = [
  JwtModule.register({
    global: true,
  }),
  ThrottlerModule.forRoot({
    throttlers: throttleConfig,
    errorMessage: 'Too many requests, please try again later.',
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    validate: validateEnv,
  }),
  LoggerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env>) => ({
      pinoHttp: {
        transport: {
          target: config.get('NODE_ENV') !== 'production' ? 'pino-pretty' : '',
        },
      },
    }),
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env>) => ({
      type: 'postgres',
      host: config.get('DB_HOST'),
      port: config.get('DB_PORT'),
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_NAME'),
      ssl: config.get('DB_SSL') === 'true',
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    }),
  }),
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env>) => ({
      transport: {
        service: config.get('MAIL_HOST'),
        auth: {
          user: config.get('MAIL_USERNAME'),
          pass: config.get('MAIL_PASSWORD'),
        },
      },
    }),
  }),
];
