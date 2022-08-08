export default {
  type: "object",
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        listId: { type: 'string', minLength: 1 },
        taskId: { type: 'string', minLength: 1 },
      },
      required: ['listId', 'taskId']
    }
  },
  required: ['queryStringParameters']
} as const;
