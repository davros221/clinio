import { defineConfig } from "@hey-api/openapi-ts";

// note: run codegen:remote for the openapi to attach via VITE_API_URL to remote
const apiUrl = process.env.VITE_API_URL ?? "http://localhost:8000";

export default defineConfig({
  input: `${apiUrl}/api-json`,
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
