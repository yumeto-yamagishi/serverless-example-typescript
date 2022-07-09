import "source-map-support/register";

import requestConstraints from "../../constraints/task/get.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import DatabaseService from "../../services/database.service";
import { RequestHandler, wrapAsRequest } from "../../utils/lambda-handler";
import { databaseTables, validateRequest } from "../../utils/util";

const getTaskHandler: RequestHandler<never> = async (_body, queryParams) => {
  const databaseService = new DatabaseService();
  const { tasksTable } = databaseTables();

  try {
    await validateRequest(queryParams, requestConstraints);
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
  } catch (error) {
    return error instanceof ResponseModel
      ? error
      : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.GET_TASK_FAIL);
  }
};

export const getTask = wrapAsRequest(getTaskHandler);
