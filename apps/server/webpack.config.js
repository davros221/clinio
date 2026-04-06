const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join } = require("path");
const webpack = require("webpack");

module.exports = {
  output: {
    path: join(__dirname, "dist"),
    clean: true,
    ...(process.env.NODE_ENV !== "production" && {
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    }),
  },
  externals: [
    function ({ request }, callback) {
      if (
        request === "swagger-ui-dist" ||
        (request && request.startsWith("swagger-ui-dist/")) ||
        (request && request.startsWith("@css-inline/"))
      ) {
        return callback(null, "commonjs " + request);
      }
      callback();
    },
  ],
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const ignoredPatterns = [
          /^@as-integrations\/fastify/,
          /^@apollo\/(subgraph|gateway)/,
          /^class-transformer/,
          /^class-validator/,
          /^@google-cloud\/spanner/,
          /^@sap\/hana-client/,
          /^better-sqlite3/,
          /^ioredis/,
          /^mongodb/,
          /^mssql/,
          /^mysql2?$/,
          /^oracledb/,
          /^pg-native/,
          /^pg-query-stream/,
          /^react-native-sqlite-storage/,
          /^redis$/,
          /^sql\.js/,
          /^sqlite3/,
          /^typeorm-aurora-data-api-driver/,
          /^bufferutil$/,
          /^utf-8-validate$/,
          /^ts-morph/,
          /^bullmq/,
        ];
        return ignoredPatterns.some((p) => p.test(resource));
      },
    }),
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "tsc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      assets: [
        "./src/assets",
        {
          input: "./src/modules/mail/templates",
          glob: "**/*.hbs",
          output: "templates",
        },
      ],
      optimization: false,
      outputHashing: "none",
      generatePackageJson: false,
      sourceMap: true,
      mergeExternals: true,
    }),
  ],
};
