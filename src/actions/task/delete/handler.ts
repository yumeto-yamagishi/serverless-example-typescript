import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ResponseModel from "../../../models/response.model";
import DatabaseService, { DeleteItem } from "../../../services/database.service";
import { middyfy, ValidatedRequestEventHandler } from "../../../utils/lambda-handler";
import { databaseTables } from "../../../utils/util";
import eventSchema from "./schema";

const deleteTaskHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const databaseService = new DatabaseService();
  const { tasksTable } = databaseTables();

  const { taskId, listId } = event.queryStringParameters;
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
};

export const main = middyfy(deleteTaskHandler, {
  eventSchema,
  unhandledErrorMessage: ResponseMessage.DELETE_TASK_FAIL
});
