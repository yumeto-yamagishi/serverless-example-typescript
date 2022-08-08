import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ResponseModel from "../../../models/response.model";
import DatabaseService, {
  DeleteItem,
  QueryItem
} from "../../../services/database.service";
import { middyfy, ValidatedRequestEventHandler } from "../../../utils/lambda-handler";
import {
  createChunks,
  databaseTables
} from "../../../utils/util";
import eventSchema from "./schema";

const deleteListHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const { listTable, tasksTable } = databaseTables();
  const databaseService = new DatabaseService();

  const { listId } = event.queryStringParameters;

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
};

export const main = middyfy(deleteListHandler, {
  eventSchema,
  unhandledErrorMessage: ResponseMessage.DELETE_LIST_FAIL
});
