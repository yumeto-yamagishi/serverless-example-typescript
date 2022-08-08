import { handlerPath } from "../../../utils/handler-resolver"

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "DELETE",
        path: "task",
        cors: true,
      },
    },
  ],
};
