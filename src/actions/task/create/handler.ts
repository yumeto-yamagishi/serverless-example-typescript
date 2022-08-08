import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ResponseModel from "../../../models/response.model";
import TaskModel from "../../../models/task.model";
import DatabaseService, { PutItem } from "../../../services/database.service";
import { middyfy_new, ValidatedRequestEventHandler } from "../../../utils/lambda-handler";
import { databaseTables } from "../../../utils/util";
import eventSchema from "./schema";

const createTaskHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const databaseService = new DatabaseService();
  const { listTable, tasksTable } = databaseTables();

  // validate with DB data
  await Promise.all([
    databaseService.getItem({
      key: event.body.listId,
      tableName: listTable,
    }),
  ]);
  const taskModel = new TaskModel({ ...event.body, completed: false });
  const data = taskModel.toEntityMapping();

  const params: PutItem = {
    TableName: tasksTable,
    Item: {
      id: data.id,
      listId: data.listId,
      description: data.description,
      completed: data.completed,
      createdAt: data.timestamp,
      updatedAt: data.timestamp,
    },
  };
  await databaseService.create(params);
  return new ResponseModel(
    { taskId: data.id },
    StatusCode.CREATED,
    ResponseMessage.CREATE_TASK_SUCCESS
  );
};

export const main = middyfy_new(createTaskHandler, {
  eventSchema,
  unhandledErrorMessage: ResponseMessage.CREATE_TASK_FAIL
});
