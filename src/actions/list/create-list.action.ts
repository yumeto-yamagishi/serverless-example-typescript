import "source-map-support/register";

import requestConstraints from "../../constraints/list/create.constraint.json";
import { ResponseMessage } from "../../enums/response-message.enum";
import { StatusCode } from "../../enums/status-code.enum";
import ListModel, { IListInterface } from "../../models/list.model";
import ResponseModel from "../../models/response.model";
import DatabaseService, { PutItem } from "../../services/database.service";
import { RequestHandler, middyfy } from "../../utils/lambda-handler";
import { databaseTables, validateRequest } from "../../utils/util";

const createListHandler: RequestHandler<IListInterface> = async (body) => {
  await validateRequest(body, requestConstraints);
  const databaseService = new DatabaseService();

  const listModel = new ListModel(body);
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

export const createList = middyfy(createListHandler, { unhandledErrorMessage: ResponseMessage.CREATE_LIST_FAIL });
