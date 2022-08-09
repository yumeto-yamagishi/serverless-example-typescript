import { handlerPath } from "../utils/handler-resolver"

const handleApiGatewayLog = {
  handler: `${handlerPath(__dirname)}/cloudwatch-logs-handler.main`,

  // TODO Fix
  // Warning: Invalid configuration encountered
  // at 'functions.handleApiGatewayLog.events.0': unsupported function event
  //
  // Learn more about configuration validation here: http://slss.io/configuration-validation
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
