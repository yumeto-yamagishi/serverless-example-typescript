
// see serverless.ts environment
const { LIST_TABLE, TASKS_TABLE, STAGE, REGION, DYNAMODB_LOCAL_STAGES, DYNAMODB_LOCAL_PORT } = process.env;

export const stage = STAGE!;
export const region = REGION!;

export const databaseTables = {
    listTable: LIST_TABLE ?? "unknown-list-table",
    tasksTable: TASKS_TABLE ?? "unknown-tasks-table",
};

const dynamoDbLocalStages = DYNAMODB_LOCAL_STAGES?.split(",") ?? [];
export const dynamodbLocalConfig = {
    enabled: dynamoDbLocalStages.includes(stage),
    dynamoDbLocalStages,
    port: DYNAMODB_LOCAL_PORT ? parseInt(DYNAMODB_LOCAL_PORT) : undefined
}

export default {
    stage,
    region,
    databaseTables,
    dynamodbLocalConfig,
} as const;
