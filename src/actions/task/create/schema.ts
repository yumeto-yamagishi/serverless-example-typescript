export default {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        listId: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 }
      },
      required: ['listId', 'description']
    }
  },
  required: ['body']
} as const;
