import "source-map-support/register";

import middy from "@middy/core";
import middyCors from "@middy/http-cors";
import middyErrorHandler from "@middy/http-error-handler";
import middyEventNormalizer from "@middy/http-event-normalizer";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ResponseMessage } from "../enums/response-message.enum";
import { StatusCode } from "../enums/status-code.enum";
import ResponseModel from "../models/response.model";

export type RequestHandler<REQ> = (
  body: REQ,
  params: QueryParams,
  context: Context
) => Promise<ResponseModel>;
export type QueryParams = Record<string, string | undefined>;

type APIGatewayProxyEventHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

type Option = { unhandledErrorMessage?: string };

export const middyfy = <REQ = unknown>(
  handler: RequestHandler<REQ>,
  opt: Option = {}
): APIGatewayProxyEventHandler => {

  const apiGatewayEventHandler = wrapToApiGatewayEventHandler(handler, opt);

  return middy(apiGatewayEventHandler)
    .use(middyEventNormalizer())
    .use(middyJsonBodyParser())
    .use(middyCors({
      origin: "*",
      credentials: true,
    }))
    .use(middyErrorHandler())
};

const wrapToApiGatewayEventHandler = <REQ>(
  handler: RequestHandler<REQ>,
  opt: Option
): APIGatewayProxyEventHandler => {
  return async function (event, context) {
    // Already parsed from JsonString to object by using middyJsonBodyParser()
    const requestData = event.body as unknown as REQ;
    // Already normalized by using middyEventNormalizer()
    const params = event.queryStringParameters ?? {};

    let response: ResponseModel;
    try {
      response = await handler(requestData, params, context);
    } catch (error: any) {
      response = error instanceof ResponseModel
        ? error
        : new ResponseModel(
            {},
            StatusCode.ERROR,
            opt.unhandledErrorMessage || ResponseMessage.ERROR
          );
    }

    // convert ResponseModel to APIGatewayProxyResult
    return {
      statusCode: response.code,
      body: JSON.stringify(response.body),
    };
  }
}