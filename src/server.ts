import app from "./app";
import dbConnection from "./config/dbConfig";
import { envConfig } from "./config/envConfig";
import Logger from "./helpers/logger";
import { SuccessMessages, ErrorMessages } from "./validation/responseMessages";

const Port = envConfig.Port;

async function startServer() {
  try {
    app.listen(Port, () => {
      Logger.info(SuccessMessages.ServerRunning);
    });

    await dbConnection;
    Logger.info(SuccessMessages.DataBaseRunning);
  } catch (error) {
    Logger.error(ErrorMessages.DatabaseError, error);
  }
}
startServer().catch((error) => {
  Logger.error(ErrorMessages.ServerError, error);
});
