import "source-map-support/register";

import requestConstraints from "../../constraints/list/get.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import DatabaseService, { QueryItem } from "../../services/database.service";
import { RequestHandler, wrapAsRequest } from "../../utils/lambda-handler";
import { databaseTables, validateRequest } from "../../utils/util";

const getListHandler: RequestHandler<never> = async (_body, queryParams) => {
  const databaseService = new DatabaseService();
  const { listTable, tasksTable } = databaseTables();

  try {
    await validateRequest(queryParams, requestConstraints);
    const { listId } = queryParams;
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
  } catch (error) {
    return error instanceof ResponseModel
      ? error
      : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.GET_LIST_FAIL);
  }
};

export const getList = wrapAsRequest(getListHandler);
