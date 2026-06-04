import 'dotenv/config'; // 必须最先执行：在任何模块（JwtModule.register 等在 require 时读 env）之前加载 .env
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Skill 市场 API')
    .setDescription(
      'Skill 市场：多源聚合、检索、购买（webhook+激活码）、开发者上传与分账。',
    )
    .setVersion('0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('skills', 'Skill 元数据：列表/检索/详情')
    .addTag('sources', '多源同步配置与记录')
    .addTag('auth', '认证与用户')
    .addTag('orders', '订单')
    .addTag('entitlements', '购买权益 / 已购')
    .addTag('activation-codes', '激活码 / 兑换码')
    .addTag('internal', '内部 webhook（HMAC 验签）')
    .addTag('developer', '开发者上传 / 收益')
    .addTag('admin', '管理后台')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  const port = parseInt(process.env.PORT || '3091', 10);
  await app.listen(port);
  Logger.log(`Skill 市场 API 启动: http://localhost:${port}/api  (docs: /api/docs)`, 'Bootstrap');
}
bootstrap();
