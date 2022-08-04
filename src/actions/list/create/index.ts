import { handlerPath } from "../../../utils/handler-resolver"

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: "list",
        method: "POST",
        cors: true,
        throttling: {
          maxRequestsPerSecond: 2,
          maxConcurrentRequests: 1,
        }
      },
    },
  ],
};
