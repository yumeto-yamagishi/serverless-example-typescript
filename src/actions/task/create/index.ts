import { handlerPath } from "../../../utils/handler-resolver"

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "POST",
        path: "task",
        cors: true,
      },
    },
  ],
};
