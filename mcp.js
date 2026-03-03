import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "add-server",
  version: "1.0.0",
});

// Add an addition tool
server.registerTool(
  "add",
  {
    title: "Addition Tool", // AI decide based upon this to use or not.
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => {
    return {
      content: [{ type: "text", text: String(a + b) }],
    };
  },
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
// Transport is just basically like how am I getting this?Like, how am I managing all the messaging out of this?We talked about there was sses, streaming HTTP and then standard IO.
// We're using that.Those are all called transports.That's what that term is in that particular case means.And we're just going to say await server, connect transport.

await server.connect(transport);
// So this is just a process that you leave running orin the case of like Claude desktop, you give it the files like to go run andthen it'll go run that server for you inside of its shared processes.

// echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {"name": "add", "arguments": {}}}' | node mcp.js | jq

//NOTE :  run this on new terminal in powershell only.

// we will get the output from here over the command as:
/*
{
  "result": {
    "tools": [
      {
        "name": "add",
        "title": "Addition Tool",
        "description": "Add two numbers",
        "inputSchema": {
          "type": "object",
          "properties": {
            "a": {
              "type": "number"
            },
            "b": {
              "type": "number"
            }
          },
          "required": [
            "a",
            "b"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        }
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 1
}
*/

// this command tells the mcp server what are the tools available, what is the command to run and what imput the tool will take and all.
// This is all the information that your MCP server would pass back to a client andbasically how they handshake it like,here's the tools that are available, right?Cuz imagine Claude Desktop is starting up.It's going to call this MCP Server, and the MCP server is going to say,here's everything that I can do for you.Here's all the text that you need to ingest to know that I havean addition tool, I have a subtraction tool.

// echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "add", "arguments": {"a": 5, "b": 3}}}' | node mcp.js | jq
// NOTE : RUN IN ONLY NEW TERMINAL WITH POWERSHELL ONLY

/**
 * {
  "result": {
    "content": [
      {
        "type": "text",
        "text": "8"
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 1
}

// here we change the two things : 1. "method": "tools/call", from "tools/list" and second we pass the arguments.
  
 */

// What's cool about this though is we now have this server thatwe can hand over to an LLM and say run this.And whenever you run into a problem shaped of this nature that this tool looks likeit can solve, pass in all of your parameters that the user has given you orthat you have invented yourself.And then I deterministically, using software,will discover the answer for you and then hand it back to you.The addition was just a good way for us to get started here.

// Now read about the RPC: Remote Procedure call, Where basically you're telling something remotely.I want you to run this function on your side.That's what the RPC parts of it stand for.
// https://mcp.holt.courses/lessons/lets-build-mcp/my-first-mcp-server

// then initialise it using the command as:
/** // NOTE : RUN IN ONLY NEW TERMINAL WITH POWERSHELL ONLY
 *
 * echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' | node mcp.js | jq
 */

// Now, we have the mcp server but we haven't used this locally with AI yet.
// go to claude>settings > developer> edit config.
// open the claude desktop config json file and add the config like :

/**
 * {
 * "mcpServers": {
    "demo-server": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Programming\\projects\\mcp-frontendmasters\\mcp.js"
      ],
      "env": {
        "NODE_OPTIONS": "--no-deprecation"
      }
    }
  }
}
 */

// now save and close the claude and re open it.
// we will find the demo mcp server in the same settings and in the connectors under the + button.

// similarly to setup in the tome, we will use the llama3.1 model and under the mcp we will add the server in which in the command we will pass as :
// node C:\\Programming\\projects\\mcp-frontendmasters\\mcp.js
// and then save it.

// now, we can the question in the chat in both claude and tome to add the two numbers using the add-server tool.
// and they will work and give us the result.