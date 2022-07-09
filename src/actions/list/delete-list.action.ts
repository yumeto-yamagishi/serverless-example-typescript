import "source-map-support/register";

import requestConstraints from "../../constraints/list/get.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import DatabaseService, {
  DeleteItem,
  QueryItem
} from "../../services/database.service";
import { RequestHandler, wrapAsRequest } from "../../utils/lambda-handler";
import {
  createChunks,
  databaseTables,
  validateRequest
} from "../../utils/util";

const deleteListHandler: RequestHandler<never> = async (_body, queryParams) => {
  const { listTable, tasksTable } = databaseTables();
  const databaseService = new DatabaseService();

  try {
    await validateRequest(queryParams, requestConstraints);
    const { listId } = queryParams;

    // check item exists
    const existsItem = await databaseService.existsItem({
      key: listId!,
      tableName: listTable,
    });
    if (!existsItem) {
      return new ResponseModel(
        {},
        StatusCode.NO_CONTENT,
        ResponseMessage.DELETE_LIST_NOTFOUND
      );
    }

    const params: DeleteItem = {
      TableName: listTable,
      Key: { id: listId },
    };
    await databaseService.delete(params); // Delete to-do list

    const taskParams: QueryItem = {
      TableName: tasksTable,
      IndexName: "list_index",
      KeyConditionExpression: "listId = :listIdVal",
      ExpressionAttributeValues: {
        ":listIdVal": listId,
      },
    };
    const results = await databaseService.query(taskParams);

    if (results?.Items && results?.Items.length) {
      const taskEntities = results?.Items?.map((item) => {
        return { DeleteRequest: { Key: { id: item.id } } };
      });

      if (taskEntities.length > 25) {
        const taskChunks = createChunks(taskEntities, 25);
        await Promise.all(
          taskChunks.map((tasks) => {
            return databaseService.batchCreate({
              RequestItems: {
                [tasksTable]: tasks,
              },
            });
          })
        );
      } else {
        await databaseService.batchCreate({
          RequestItems: {
            [tasksTable]: taskEntities,
          },
        });
      }
    }
    return new ResponseModel(
      {},
      StatusCode.NO_CONTENT,
      ResponseMessage.DELETE_LIST_SUCCESS
    );
  } catch (error) {
    return error instanceof ResponseModel
      ? error
      : new ResponseModel(
          {},
          StatusCode.ERROR,
          ResponseMessage.DELETE_LIST_FAIL
        );
  }
};

export const deleteList = wrapAsRequest(deleteListHandler);
