import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import ResponseModel from "../models/response.model";
import "source-map-support/register";

import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import middyHeaderNormalizer from "@middy/http-header-normalizer"
import middyEventNormalizer from "@middy/http-event-normalizer"
import middyCors from "@middy/http-cors"

export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export type RequestHandler<REQ> = (
  body: REQ,
  params: QueryParams,
  context: Context
) => Promise<ResponseModel>;

export type QueryParams = Record<string, string | undefined>;

export const wrapAsRequest = <REQ = unknown>(
  handler: RequestHandler<REQ>
): LambdaHandler => {
  const lambdaHandler: LambdaHandler = async (event, context) => {
    const requestData = event.body as unknown as REQ;
    const params = event.queryStringParameters ?? {};
    const response = await handler(requestData, params, context);
    return {
      statusCode: response.code,
      body: JSON.stringify(response.body),
    };
  };

  return middy(lambdaHandler)
    .use(middyEventNormalizer())
    .use(middyJsonBodyParser())
    .use(middyCors({
      origin: "*",
      credentials: true,
    }))
};
