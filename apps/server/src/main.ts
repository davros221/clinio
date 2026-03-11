import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { openApiConfig } from "./openapi/openApi.config";

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule);
  // Get the ConfigService to access configuration values
  const configService = app.get(ConfigService);

  // Enable CORS for the client URL specified in the configuration
  const clientUrl = configService.get("client.url");
  app.enableCors({ origin: clientUrl });

  // Set a global prefix for all routes (e.g., /api)
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  // Set up Swagger for API documentation
  const documentFactory = () =>
    cleanupOpenApiDoc(SwaggerModule.createDocument(app, openApiConfig));
  SwaggerModule.setup("api", app, documentFactory);

  // Start the application on the specified port
  const port = configService.get("port");

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

void bootstrap();
