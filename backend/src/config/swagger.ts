import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Personal Diary API",
      version: "1.0.0",
      description:
        "REST API for Personal Diary - A social media platform for sharing diary posts, comments, and connecting with other users",
      contact: {
        name: "API Support",
        email: "support@personaldiary.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8000/api",
        description: "Development Server",
      },
      {
        url: "https://api.personaldiary.com/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your access token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            avatar: {
              type: "string",
              nullable: true,
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            userId: {
              type: "string",
            },
            title: {
              type: "string",
            },
            content: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["DRAFT", "PUBLISHED"],
            },
            visibility: {
              type: "string",
              enum: ["PRIVATE", "PUBLIC"],
            },
            isAnonymous: {
              type: "boolean",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            postId: {
              type: "string",
            },
            userId: {
              type: "string",
            },
            content: {
              type: "string",
            },
            isAnonymous: {
              type: "boolean",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
