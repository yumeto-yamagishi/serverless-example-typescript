import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ResponseModel from "../../../models/response.model";
import DatabaseService from "../../../services/database.service";
import { middyfy_new, ValidatedRequestEventHandler } from "../../../utils/lambda-handler";
import { databaseTables } from "../../../utils/util";
import eventSchema from "./schema";

const getTaskHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const databaseService = new DatabaseService();
  const { tasksTable } = databaseTables();

  const { taskId, listId } = event.queryStringParameters;
  const data = await databaseService.getItem({
    key: taskId,
    hash: "listId",
    hashValue: listId!,
    tableName: tasksTable,
  });
  return new ResponseModel(
    { ...data.Item },
    StatusCode.OK,
    ResponseMessage.GET_TASK_SUCCESS
  );
};

export const main = middyfy_new(getTaskHandler, {
  eventSchema,
  unhandledErrorMessage: ResponseMessage.GET_TASK_FAIL
});
