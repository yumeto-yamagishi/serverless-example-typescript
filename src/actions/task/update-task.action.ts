import "source-map-support/register";

import ResponseModel from "../../models/response.model";
import DatabaseService, { UpdateItem } from "../../services/database.service";
import { databaseTables, validateRequest } from "../../utils/util";
import requestConstraints from "../../constraints/task/update.constraint.json";
import { RequestHandler, wrapAsRequest } from "../../utils/lambda-handler";
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

type UpdateTaskInput = {
  listId: string;
  taskId: string;
  completed: string;
  description: string;
};

const updateTaskHandler: RequestHandler<UpdateTaskInput> = async (body) => {
  const databaseService = new DatabaseService();
  const { listId, taskId, completed, description } = body;
  const { listTable, tasksTable } = databaseTables();

  try {
    await Promise.all([
      validateRequest(body, requestConstraints),
      databaseService.getItem({ key: listId, tableName: listTable }),
    ]);
    const isCompletedPresent = typeof completed !== "undefined";

    const updateExpression = `set ${description ? "description = :description," : ""
      } ${typeof completed !== "undefined" ? "completed = :completed," : ""
      } updatedAt = :timestamp`;

    if (description || isCompletedPresent) {
      const params: UpdateItem = {
        TableName: tasksTable,
        Key: {
          id: taskId,
          listId: listId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":timestamp": new Date().getTime(),
        },
        ReturnValues: "UPDATED_NEW",
      };
      if (description) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.ExpressionAttributeValues![":description"] = description;
      }
      if (isCompletedPresent) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        params.ExpressionAttributeValues![":completed"] = completed;
      }

      const results = await databaseService.update(params);
      return new ResponseModel(
        { ...results.Attributes },
        StatusCode.OK,
        ResponseMessage.UPDATE_TASK_SUCCESS
      );
    } else {
      return new ResponseModel(
        {},
        StatusCode.BAD_REQUEST,
        ResponseMessage.INVALID_REQUEST
      );
    }
  } catch (error) {
    return error instanceof ResponseModel
      ? error
      : new ResponseModel(
          {},
          StatusCode.ERROR,
          ResponseMessage.UPDATE_TASK_FAIL
        );
  }
};

export const updateTask = wrapAsRequest(updateTaskHandler);
