import app from "./app";
import { envConfig } from "./config/envConfig";
import "../src/config/dbConfig";

import { SuccessMessages, ErrorMessages } from "./validation/responseMessages";

const Port = envConfig.Port;

// Starting the server and listening on the specified port
app.listen(Port, () => {
  console.log(SuccessMessages.ServerRunning);
  const error = false;
  if (error) {
    console.log(ErrorMessages.ServerError);
  }
});
