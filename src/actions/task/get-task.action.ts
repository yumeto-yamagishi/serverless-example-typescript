import "source-map-support/register";

import requestConstraints from "../../constraints/task/get.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import DatabaseService from "../../services/database.service";
import { middyfy, RequestHandler } from "../../utils/lambda-handler";
import { databaseTables } from "../../utils/util";

const getTaskHandler: RequestHandler<never> = async (_body, queryParams) => {
  const databaseService = new DatabaseService();
  const { tasksTable } = databaseTables();

  const { taskId, listId } = queryParams;
  const data = await databaseService.getItem({
    key: taskId!,
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

export const getTask = middyfy(getTaskHandler, {
  constraints: { query: requestConstraints },
  unhandledErrorMessage: ResponseMessage.GET_TASK_FAIL
});
