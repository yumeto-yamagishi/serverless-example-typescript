export default {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        name: { type: 'string', minLength: 1 }
      },
      required: ['name']
    }
  },
  required: ['body']
} as const;
