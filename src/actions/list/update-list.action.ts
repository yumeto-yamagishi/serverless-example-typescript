import "source-map-support/register";

import requestConstraints from "../../constraints/list/update.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ResponseModel from "../../models/response.model";
import DatabaseService, { UpdateItem } from "../../services/database.service";
import { RequestHandler, middyfy } from "../../utils/lambda-handler";
import { databaseTables } from "../../utils/util";

const updateListHandler: RequestHandler<{ listId: string; name: string; }> = async (body) => {
  const databaseService = new DatabaseService();
  const { listTable } = databaseTables();
  const { listId, name } = body;

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

export const updateList = middyfy(updateListHandler, {
  constraints: { body: requestConstraints },
  unhandledErrorMessage: ResponseMessage.UPDATE_LIST_FAIL
});
