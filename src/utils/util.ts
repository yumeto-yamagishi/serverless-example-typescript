import validate from "validate.js/validate";

import ResponseModel from "../models/response.model";

export type Constraints = { [key in string]: unknown };

export const validateRequest = async <INPUT>(
  values: INPUT,
  constraints: {body?: Constraints, query?: Constraints}
): Promise<INPUT> => {
  const validation = {
    ...(constraints.body && validate(values["body"], constraints.body) || {}),
    ...(constraints.query && validate(values["queryStringParameters"], constraints.query) || {}),
  };
    if (Object.keys(validation).length === 0) {
      return values;
    }
    throw new ResponseModel({ validation }, 400, "required fields are missing");
};

export const createChunks = <T>(data: T[], chunkSize: number): T[][] => {
  const urlChunks: T[][] = [];
  let batchIterator = 0;
  while (batchIterator < data.length) {
    urlChunks.push(data.slice(batchIterator, (batchIterator += chunkSize)));
  }
  return urlChunks;
};

export type DatabaseProp = {
  listTable: string;
  tasksTable: string;
};

export const databaseTables = (): DatabaseProp => {
  const { LIST_TABLE, TASKS_TABLE } = process.env;
  return {
    listTable: LIST_TABLE ?? "unknown-list-table",
    tasksTable: TASKS_TABLE ?? "unknown-tasks-table",
  };
};
