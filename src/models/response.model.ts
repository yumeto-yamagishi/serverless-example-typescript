import { Status } from "../enums/status.enum";

interface IResponseBody {
  data: any;
  message: string;
  status?: string;
}

const STATUS_MESSAGES = {
  200: Status.SUCCESS,
  201: Status.SUCCESS,
  204: Status.SUCCESS,
  400: Status.BAD_REQUEST,
  404: Status.BAD_REQUEST,
  500: Status.ERROR,
};

export default class ResponseModel {
  readonly body: IResponseBody;

  constructor(data = {}, readonly code = 402, message = "") {
    this.body = {
      data,
      message,
      status: STATUS_MESSAGES[code],
    };
    this.code = code;
  }

  setBodyVariable = (variable: string, value: string): void => {
    this.body[variable] = value;
  };

  get message(): string {
    return this.body.message;
  }

  get data(): any {
    return this.body.data;
  }
}
