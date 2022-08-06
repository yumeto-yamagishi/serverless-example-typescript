export default {
  type: "object",
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        listId: { type: 'string', minLength: 1 }
      },
      required: ['listId']
    }
  },
  required: ['queryStringParameters']
} as const;
