import "source-map-support/register";

import requestConstraints from "../../constraints/task/create.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import TaskModel, { ITaskInterface } from "../../models/task.model";
import DatabaseService, { PutItem } from "../../services/database.service";
import { middyfy, RequestHandler } from "../../utils/lambda-handler";
import { databaseTables } from "../../utils/util";

const createTaskHandler: RequestHandler<ITaskInterface> = async (body) => {
  const databaseService = new DatabaseService();
  const { listTable, tasksTable } = databaseTables();

  // validate with DB data
  await Promise.all([
    databaseService.getItem({
      key: body.listId,
      tableName: listTable,
    }),
  ]);
  const taskModel = new TaskModel(body);
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

export const createTask = middyfy(createTaskHandler, {
  constraints: { body: requestConstraints },
  unhandledErrorMessage: ResponseMessage.CREATE_TASK_FAIL
});
