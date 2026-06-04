"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Skill 市场 API')
        .setDescription('Skill 市场：多源聚合、检索、购买（webhook+激活码）、开发者上传与分账。')
        .setVersion('0.1')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'JWT-auth')
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });
    const port = parseInt(process.env.PORT || '3091', 10);
    await app.listen(port);
    common_1.Logger.log(`Skill 市场 API 启动: http://localhost:${port}/api  (docs: /api/docs)`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map