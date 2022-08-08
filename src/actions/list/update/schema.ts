export default {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        listId: { type: 'string', minLength: 1 },
        name: { type: 'string', minLength: 1 },
      },
      required: [
        'name',
        'listId',
      ],
    }
  },
  required: ['body']
} as const;
