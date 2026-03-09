import { DocumentBuilder } from "@nestjs/swagger";

export const openApiConfig = new DocumentBuilder()
  .setTitle("ClinIO API Documentation")
  .setDescription(
    `REST API for the ClinIO platform.
    
    ## Authentication
    All endpoints require a valid Bearer token unless marked as public.
    
    ## Error Handling
    - 400: Bad Request - The request was invalid or cannot be processed.
    - 401: Unauthorized - Authentication is required and has failed or has not yet been provided.
    - 403: Forbidden - The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource.
    - 404: Not Found - The requested resource could not be found.
    - 500: Internal Server Error - An error occurred on the server side.
    `
  )
  .setBasePath("/api")
  .setVersion("1.0")
  .addBearerAuth()
  .addOAuth2()
  .build();
