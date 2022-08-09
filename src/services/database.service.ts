import * as AWS from "aws-sdk";

import ResponseModel from "../models/response.model";

import { ConfigurationOptions } from "aws-sdk";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
import { dynamodbLocalConfig, region, stage, databaseTables } from "../config";
import { ResponseMessage } from "../enums/response-message.enum";
import { StatusCode } from "../enums/status-code.enum";

export type PutItem = AWS.DynamoDB.DocumentClient.PutItemInput;
export type PutItemOutput = AWS.DynamoDB.DocumentClient.PutItemOutput;

export type BatchWrite = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
export type BatchWriteOutput = AWS.DynamoDB.DocumentClient.BatchWriteItemOutput;

export type UpdateItem = AWS.DynamoDB.DocumentClient.UpdateItemInput;
export type UpdateItemOutput = AWS.DynamoDB.DocumentClient.UpdateItemOutput;

export type QueryItem = AWS.DynamoDB.DocumentClient.QueryInput;
export type QueryItemOutput = AWS.DynamoDB.DocumentClient.QueryOutput;

export type GetItem = AWS.DynamoDB.DocumentClient.GetItemInput;
export type GetItemOutput = AWS.DynamoDB.DocumentClient.GetItemOutput;

export type DeleteItem = AWS.DynamoDB.DocumentClient.DeleteItemInput;
export type DeleteItemOutput = AWS.DynamoDB.DocumentClient.DeleteItemOutput;

type Item = Record<string, string>;
type ServiceOption = ConfigurationOptions & ConfigurationServicePlaceholders;

const config: ServiceOption = {
  region,
};

if (dynamodbLocalConfig.enabled) {
  config.credentials = {
    accessKeyId: "dummy",
    secretAccessKey: "dummy"
  };
  config.dynamodb = {
    ...config.dynamodb,
    endpoint: `http://localhost:${dynamodbLocalConfig.port}`,
  };
  console.log("dynamodb-local mode", config);
} else {
  console.log("running dynamodb on aws on stage:", stage);
}
AWS.config.update(config);


export default class DatabaseService {
  private readonly documentClient: AWS.DynamoDB.DocumentClient;

  constructor(option?: ServiceOption) {
    this.documentClient = new AWS.DynamoDB.DocumentClient(option);
  }

  getItem = async ({
    key,
    hash,
    hashValue,
    tableName,
  }: Item): Promise<GetItemOutput> => {
    const params = {
      TableName: tableName,
      Key: {
        id: key,
      },
    };
    if (hash) {
      params.Key[hash] = hashValue;
    }
    const results = await this.get(params);
    if (Object.keys(results).length) {
      return results;
    }
    console.log("item does not exist");
    throw new ResponseModel(
      { id: key },
      StatusCode.NOT_FOUND,
      ResponseMessage.GET_ITEM_ERROR
    );
  };

  existsItem = async ({
    key,
    hash,
    hashValue,
    tableName,
  }: Item): Promise<boolean> => {
    try {
      await this.getItem({ key, hash, hashValue, tableName });
      return true;
    } catch (e) {
      if (e instanceof ResponseModel) {
        return e.code !== StatusCode.NOT_FOUND;
      } else {
        throw e;
      }
    }
  };

  create = async (params: PutItem): Promise<PutItemOutput> => {
    try {
      return await this.documentClient.put(params).promise();
    } catch (error) {
      console.error("create-error", error);
      throw new ResponseModel({}, StatusCode.ERROR, `create-error: ${error}`);
    }
  };

  batchCreate = async (params: BatchWrite): Promise<BatchWriteOutput> => {
    try {
      return await this.documentClient.batchWrite(params).promise();
    } catch (error) {
      throw new ResponseModel(
        {},
        StatusCode.ERROR,
        `batch-write-error: ${error}`
      );
    }
  };

  update = async (params: UpdateItem): Promise<UpdateItemOutput> => {
    try {
      return await this.documentClient.update(params).promise();
    } catch (error) {
      throw new ResponseModel({}, StatusCode.ERROR, `update-error: ${error}`);
    }
  };

  query = async (params: QueryItem): Promise<QueryItemOutput> => {
    try {
      return await this.documentClient.query(params).promise();
    } catch (error) {
      throw new ResponseModel({}, StatusCode.ERROR, `query-error: ${error}`);
    }
  };

  get = async (params: GetItem): Promise<GetItemOutput> => {
    try {
      return await this.documentClient.get(params).promise();
    } catch (error) {
      throw new ResponseModel({}, StatusCode.ERROR, `get-error: ${error}`);
    }
  };

  delete = async (params: DeleteItem): Promise<DeleteItemOutput> => {
    try {
      return await this.documentClient.delete(params).promise();
    } catch (error) {
      throw new ResponseModel({}, StatusCode.ERROR, `delete-error: ${error}`);
    }
  };
}


const _databaseServiceInstance = new DatabaseService(config);
export {
  databaseTables as tables,
  _databaseServiceInstance as databaseService
};
