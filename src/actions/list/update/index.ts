import { handlerPath } from "../../../utils/handler-resolver"

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "PUT",
        path: "list",
        cors: true,
      },
    },
  ],
};
