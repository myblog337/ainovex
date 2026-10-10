import app from "./app";
import { logger } from "./lib/logger";
import { seedAdminContent } from "./data/seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

void seedAdminContent()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  })
  .catch((error: unknown) => {
    logger.error(
      {
        error:
          error instanceof Error
            ? error.message.slice(0, 300)
            : String(error).slice(0, 300),
      },
      "AINOVEX admin data initialization failed",
    );
    process.exit(1);
  });
