import "source-map-support/register";

import middy from "@middy/core";
import middyCors from "@middy/http-cors";
import middyErrorHandler from "@middy/http-error-handler";
import middyEventNormalizer from "@middy/http-event-normalizer";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { HttpError } from "@middy/util";
import middyValidator from "@middy/validator";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from "aws-lambda";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { ResponseMessage } from "../enums/response-message.enum";
import { StatusCode } from "../enums/status-code.enum";
import ResponseModel from "../models/response.model";
import { Constraints, validateRequest } from "../utils/util";

// ApiGateway and Handers
export type ValidatedRequestEvent<S> = FromSchema<S>;
export type ValidatedRequestEventHandler<S> = Handler<ValidatedRequestEvent<S>, ResponseModel>;

type MiddyfyOption<S = undefined> = { eventSchema: S, unhandledErrorMessage?: string };
export function middyfy_new<S extends JSONSchema, H extends ValidatedRequestEventHandler<S>>(handler: H, opt?: MiddyfyOption<S>) {
  // NOTE: Do NOT define this function as follows:
  // function middyfy_new<S extends JSONSchema>(handler: ValidatedRequestEventHandler<S>, opt?: MiddyfyOption<S>)
  //
  // It causes "error TS2589: Type instantiation is excessively deep and possibly infinite."

  const middyfied = middy()
    .use(middyErrorHandler({ fallbackMessage: opt?.unhandledErrorMessage }))
    .use(middyEventNormalizer())
    .use(middyJsonBodyParser())
    .use(responseModelConverter)
    .use(opt?.eventSchema
      ? [
        middyValidator({ eventSchema: opt.eventSchema }),
        validationErrorToResponseModelConverter()
      ] : []
    )
    .handler(handler);

  return middyfied;
}


/**
 * Convert @middy/validator error to `ResponseModel`
 */
function validationErrorToResponseModelConverter() {
  /**
   * Checks and cast the given e is HttpError with validation failed cause thrown by @middy/validator.
   * @param e the thrown error to be checked.
   * @returns true with type cast when `e` is validation error.
   */
  function isValidationError(e: any): e is HttpError & { cause: unknown } {
    return e?.statusCode === StatusCode.BAD_REQUEST
      && e?.expose === true
      && typeof e?.message === "string"
      && typeof e?.cause === "object";
  }
  return {
    onError: (request) => {
      const { error } = request;
      if (isValidationError(error)) {
        request.response = new ResponseModel({ validation: error.cause }, error.statusCode, error.message);
      }
    }
  }
};

const responseModelConverterFn: middy.MiddlewareFn = (request) => {
  const { response, error } = request;

  let responseModel: ResponseModel | undefined;
  if (response instanceof ResponseModel) {
    responseModel = response;
  } else if (response !== undefined) {
    // Already response is resolved
    return response;
  } else if (error instanceof ResponseModel) {
    responseModel = error;
  }
  if (responseModel) {
    request.response = {
      statusCode: responseModel.code,
      body: JSON.stringify(responseModel.body),
    };
  }
};

/**
 * Convert `ResponseModel` to `ApiGatewayProxyResult`
 */
const responseModelConverter: middy.MiddlewareObj = {
  after: responseModelConverterFn,
  onError: responseModelConverterFn,
}


export type RequestHandler<REQ> = (
  body: REQ,
  params: QueryParams,
  context: Context
) => Promise<ResponseModel>;
export type QueryParams = Record<string, string | undefined>;

type Option = {
  constraints?: { body?: Constraints, query?: Constraints },
  unhandledErrorMessage?: string
};

export const middyfy = <REQ = unknown>(
  handler: RequestHandler<REQ>,
  opt: Option = {}
): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> => {

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
): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return async function (event, context) {
    // Already parsed from JsonString to object by using middyJsonBodyParser()
    const requestData = event.body as unknown as REQ;
    // Already normalized by using middyEventNormalizer()
    const queryParams = event.queryStringParameters ?? {};

    let response: ResponseModel;
    try {
      opt.constraints && await validateRequest(event, opt.constraints)
      response = await handler(requestData, queryParams, context);
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