import { defineConfig } from "@hey-api/openapi-ts";

// apiUrl is taken from VITE_API_URL (e.g. when running codegen:local or codegen:remote)
// falling back to localhost
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
