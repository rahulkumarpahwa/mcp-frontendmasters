import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const styleGuideMarkdown = fs.readFileSync(
  path.join(__dirname, "style-guide.md"),
  "utf8",
);

const server = new McpServer({
  name: "style-checker",
  version: "1.0.0",
});

server.registerPrompt(
  "review-code",
  {
    title: "Code Review",
    description: "Review code for best practices and potential issues",
    argsSchema: { code: z.string() },
  },
  ({ code }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please review this code to see if it follows our best practices. Use this style guide as a reference and the rules\n\n=======================${styleGuideMarkdown}\n\n============================\n\n=========================\n\nHere is the code to review:\n\n${code}`,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

// Brian introduces the prompts API for registering prompts within an MCP server. A prompt is created to review code generated from the LLM and ensure it conforms to a provided coding style guide.
