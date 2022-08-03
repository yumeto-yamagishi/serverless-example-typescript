export default {
  handler: "src/actions/list/create/handler.main",
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
