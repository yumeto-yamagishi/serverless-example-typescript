export default {
  deleteTask: {
    handler: "src/actions/handler.deleteTask",
    events: [
      {
        http: {
          method: "DELETE",
          path: "task",
          cors: true,
        },
      },
    ],
  },
  getTask: {
    handler: "src/actions/handler.getTask",
    events: [
      {
        http: {
          method: "GET",
          path: "task",
          cors: true,
        },
      },
    ],
  },
  updateTask: {
    handler: "src/actions/handler.updateTask",
    events: [
      {
        http: {
          method: "PUT",
          path: "task",
          cors: true,
        },
      },
    ],
  },
  handleApiGatewayLog: {
    handler: "src/ops-handler.handleApiGatewayLog",
    events: [
      {
        subscriptionFilter: {
          stage: "${self:custom.stage}",
          logGroupName: "/aws/api-gateway/${self:service}-${self:custom.stage}",
          filterPattern:
            '{$.status = "429" || $.status = "502" || $.status = "504"}',
        },
      } as any,
    ],
  },
};
