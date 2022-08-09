import { handlerPath } from "../utils/handler-resolver"

const handleApiGatewayLog = {
  handler: `${handlerPath(__dirname)}/cloudwatch-logs-handler.main`,
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
};

export default {
  handleApiGatewayLog
};
