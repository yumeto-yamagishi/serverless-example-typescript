import "source-map-support/register";

import middy from "@middy/core";
import middyErrorHandler from "@middy/http-error-handler";
import middyEventNormalizer from "@middy/http-event-normalizer";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { HttpError } from "@middy/util";
import middyValidator from "@middy/validator";
import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { StatusCode } from "../enums/status-code.enum";
import ResponseModel from "../models/response.model";

// ApiGateway and Handers

/**
 * RequestEventHandler for the ApiGatewayProxyEvent request validated with the event schema of 'S'.
 */
export type ValidatedRequestEventHandler<S extends JSONSchema> = Handler<FromSchema<S>, ResponseModel>;
/**
 * RequestEventHandler for the ApiGatewayProxyEvent request without any validation.
 */
export type ApiGatewayEventHandler = Handler<APIGatewayProxyEvent, ResponseModel>;

type MiddyfyOption = {
  /**
   * Response message in case that any unhandled (internal) error
   */
  unhandledErrorMessage?: string
};

/**
 * 
 * @param handler the event handler. Throwing ResponseModel is permitted.
 * @param opt (Required property) eventSchema is JSONSchema object to be used for runtime validation of request.
 * @returns 
 */
export function middyfy<S extends JSONSchema, H extends ValidatedRequestEventHandler<S>>(handler: H, opt: MiddyfyOption & { eventSchema: S }): middy.MiddyfiedHandler
/**
 * 
 * @param handler 
 * @param opt 
 * @returns 
 */
export function middyfy(handler: ApiGatewayEventHandler, opt?: MiddyfyOption): middy.MiddyfiedHandler
// implementation
export function middyfy<S extends JSONSchema, H extends ValidatedRequestEventHandler<S> | ApiGatewayEventHandler>(handler: H, opt?: MiddyfyOption & { eventSchema?: S }) {
  // NOTE: Do NOT define this function as follows:
  // function middyfy_new<S extends JSONSchema>(handler: ValidatedRequestEventHandler<S>, opt?: MiddyfyOption<S>)
  //
  // It causes "error TS2589: Type instantiation is excessively deep and possibly infinite."

  const middyfied = middy()
    .use(middyErrorHandler({ fallbackMessage: opt?.unhandledErrorMessage }))
    .use(middyEventNormalizer())
    .use(middyJsonBodyParser())
    .use(responseModelConverter())
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
function validationErrorToResponseModelConverter(): middy.MiddlewareObj {
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

/**
 * Convert `ResponseModel` to `ApiGatewayProxyResult`
 */
function responseModelConverter(): middy.MiddlewareObj {

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

  return {
    after: responseModelConverterFn,
    onError: responseModelConverterFn,
  }
}
