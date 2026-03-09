import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/api-json",
  output: "packages/api/src/generated",
  plugins: [
    "@hey-api/client-axios",
    "@hey-api/typescript",
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "byTags",
        containerName: (name) => `${name}Service`,
      },
    },
  ],
});
