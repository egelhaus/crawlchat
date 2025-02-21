import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { makeEmbedding, search } from "./scrape/pinecone";
import { IncomingMessage, ServerResponse } from "http";
import { prisma } from "./prisma";

let transports: Record<string, SSEServerTransport> = {};

async function makeMcpServer(scrapeId: string) {
  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
    },
  });

  if (!scrape) {
    throw new Error("Scrape not found");
  }

  const mcpServer = new McpServer({
    name: "crawl-chat",
    version: "0.0.1",
  });

  mcpServer.tool(
    `search_${scrape.title?.replace(/\s+/g, "_")}`,
    {
      query: z.string({
        description: "The query to search for. Keep it short and concise.",
      }),
    },
    async function ({ query }: { query: string }) {
      const result = await search(
        scrape.userId,
        scrape.id,
        await makeEmbedding(query)
      );

      return {
        content: result.matches.map((match) => ({
          type: "text",
          text: match.metadata!.content as string,
        })),
      };
    }
  );

  return mcpServer;
}

export const handleSse = async (res: ServerResponse, scrapeId: string) => {
  const transportId = crypto.randomUUID();
  const transport = new SSEServerTransport(`/sse/message/${transportId}`, res);
  transports[transportId] = transport;
  const mcpServer = await makeMcpServer(scrapeId);
  mcpServer.connect(transport);
  console.log("SSE connected");
};

export const handlePostMessage = async (
  req: IncomingMessage,
  res: ServerResponse,
  transportId: string
) => {
  const transport = transports[transportId];
  if (!transport) {
    throw new Error("Transport not found");
  }
  await transport.handlePostMessage(req, res);
};
