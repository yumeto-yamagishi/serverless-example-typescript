import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ResponseModel from "../../../models/response.model";
import DatabaseService, { QueryItem } from "../../../services/database.service";
import { middyfy_new, ValidatedRequestEventHandler } from "../../../utils/lambda-handler";
import { databaseTables } from "../../../utils/util";
import eventSchema from "./schema";

const getListHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const databaseService = new DatabaseService();
  const { listTable, tasksTable } = databaseTables();

  const { listId } = event.queryStringParameters;
  const data = await databaseService.getItem({
    key: listId!,
    tableName: listTable,
  });

  const params: QueryItem = {
    TableName: tasksTable,
    IndexName: "list_index",
    KeyConditionExpression: "listId = :listIdVal",
    ExpressionAttributeValues: {
      ":listIdVal": listId,
    },
  };

  const results = await databaseService.query(params);
  const tasks = results?.Items?.map((task) => {
    return {
      id: task.id,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  });

  return new ResponseModel(
    {
      ...data.Item,
      taskCount: tasks?.length,
      tasks: tasks,
    },
    StatusCode.OK,
    ResponseMessage.GET_LIST_SUCCESS
  );
};

export const main = middyfy_new(getListHandler, {
  eventSchema,
  unhandledErrorMessage: ResponseMessage.GET_LIST_FAIL
});
