import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './middleware/logger.middleware';
import { ValidationPipe, Logger } from '@nestjs/common';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CronService } from './service/cron.service';
import { ConfigServiceStatic } from './provider/config/config.service';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
        { bodyParser: true },
    );

    app.use(logger);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
        validationError: {
            target: false,
            value: false,
        },
    }));

    const cronService = app.get(CronService);
    cronService.fire();

    await app.listen(ConfigServiceStatic.port);
}
bootstrap();
