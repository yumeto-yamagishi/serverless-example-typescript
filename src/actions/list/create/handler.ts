import "source-map-support/register";

import { ResponseMessage } from "../../../enums/response-message.enum";
import { StatusCode } from "../../../enums/status-code.enum";
import ListModel from "../../../models/list.model";
import ResponseModel from "../../../models/response.model";
import DatabaseService, { PutItem } from "../../../services/database.service";
import { ValidatedRequestEventHandler, middyfy_new } from "../../../utils/lambda-handler";
import { databaseTables } from "../../../utils/util";
import eventSchema from "./schema";

const unhandledErrorMessage = ResponseMessage.CREATE_LIST_FAIL;

const createListHandler: ValidatedRequestEventHandler<typeof eventSchema> = async (event) => {
  const databaseService = new DatabaseService();

  const listModel = new ListModel({ name: event.body.name });
  const data = listModel.toEntityMappings();
  const params: PutItem = {
    TableName: databaseTables().listTable,
    Item: {
      id: data.id,
      name: data.name,
      createdAt: data.timestamp,
      updatedAt: data.timestamp,
    },
  };
  await databaseService.create(params);
  return new ResponseModel(
    { listId: data.id },
    StatusCode.CREATED,
    ResponseMessage.CREATE_LIST_SUCCESS
  );
};

export const main = middyfy_new(createListHandler, { eventSchema, unhandledErrorMessage });
