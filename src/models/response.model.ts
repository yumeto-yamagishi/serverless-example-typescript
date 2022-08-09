import { Status } from "../enums/status.enum";

interface IResponseBody {
  data: any;
  message: string;
  status?: Status;
}

const STATUS_MESSAGES = {
  200: Status.SUCCESS,
  201: Status.SUCCESS,
  204: Status.SUCCESS,
  400: Status.BAD_REQUEST,
  404: Status.BAD_REQUEST,
  500: Status.ERROR,
} as const;

export default class ResponseModel extends Error {
  readonly body: IResponseBody;

  constructor(data = {}, readonly code = 402, message = "") {
    super();
    this.body = {
      data,
      message,
      status: STATUS_MESSAGES[code],
    };
  }

  setBodyVariable = (variable: string, value: string): void => {
    this.body[variable] = value;
  };

  get data(): any {
    return this.body.data;
  }

  // implementation of Error interface

  get message(): string {
    return this.body.message;
  }

  get name(): string {
    return this.body.status ?? Status.ERROR;
  }
}
