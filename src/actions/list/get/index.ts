import { handlerPath } from "../../../utils/handler-resolver"

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "GET",
        path: "list",
        cors: true,
      },
    },
  ],
};
