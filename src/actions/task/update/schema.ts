export default {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        listId: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        taskId: { type: 'string', minLength: 1 },
        completed: { type: 'boolean' },
      },
      required: ['listId', 'taskId']
    }
  },
  required: ['body']
} as const;
