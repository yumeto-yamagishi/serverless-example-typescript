import "source-map-support/register";

import requestConstraints from "../../constraints/task/delete.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import DatabaseService, { DeleteItem } from "../../services/database.service";
import { RequestHandler, wrapAsRequest } from "../../utils/lambda-handler";
import { databaseTables, validateRequest } from "../../utils/util";

const deleteTaskHandler: RequestHandler<never> = async (_body, queryParams) => {
  const databaseService = new DatabaseService();
  const { tasksTable } = databaseTables();

  try {
    await validateRequest(queryParams, requestConstraints);
    const { taskId, listId } = queryParams;
    const existsItem = await databaseService.existsItem({
      key: taskId!,
      hash: "listId",
      hashValue: listId!,
      tableName: tasksTable,
    });
    if (!existsItem) {
      return new ResponseModel(
        {},
        StatusCode.NO_CONTENT,
        ResponseMessage.DELETE_TASK_NOTFOUND
      );
    }
    const params: DeleteItem = {
      TableName: tasksTable,
      Key: {
        id: taskId,
        listId: listId,
      },
    };
    await databaseService.delete(params);
    return new ResponseModel(
      {},
      StatusCode.NO_CONTENT,
      ResponseMessage.DELETE_TASK_SUCCESS
    );
  } catch (error) {
    return error instanceof ResponseModel
      ? error
      : new ResponseModel(
          {},
          StatusCode.ERROR,
          ResponseMessage.DELETE_TASK_FAIL
        );
  }
};

export const deleteTask = wrapAsRequest(deleteTaskHandler);
