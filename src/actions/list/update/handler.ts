import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ResponseModel from "../../../models/response.model";
import { databaseService, tables, UpdateItem } from "../../../services/database.service";
import { middyfy, ValidatedRequestEventHandler } from "../../../utils/lambda-handler";
import eventSchema from "./schema";

const updateListHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const { listTable } = tables;
  const { listId, name } = event.body;

  // validate with DB data
  await Promise.all([
    databaseService.getItem({ key: listId, tableName: listTable }),
  ]);

  const params: UpdateItem = {
    TableName: listTable,
    Key: {
      id: listId,
    },
    UpdateExpression: "set #name = :name, updatedAt = :timestamp",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":timestamp": new Date().getTime(),
    },
    ReturnValues: "UPDATED_NEW",
  };
  const results = await databaseService.update(params);
  return new ResponseModel(
    { ...results.Attributes },
    StatusCode.OK,
    ResponseMessage.UPDATE_LIST_SUCCESS
  );
};

export const main = middyfy(updateListHandler, {
  eventSchema,
  unhandledErrorMessage: ResponseMessage.UPDATE_LIST_FAIL
});
