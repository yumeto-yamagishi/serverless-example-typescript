export default {
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
