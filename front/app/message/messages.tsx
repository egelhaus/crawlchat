import {
  Group,
  Stack,
  Text,
  Badge,
  EmptyState,
  VStack,
  Link,
  Center,
  Icon,
  Table,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import {
  TbBox,
  TbBrandDiscord,
  TbBrandSlack,
  TbMessage,
  TbRobotFace,
  TbSettingsBolt,
  TbThumbDown,
  TbThumbUp,
} from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/messages";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import { MarkdownProse } from "~/widget/markdown-prose";
import moment from "moment";
import { useMemo, useState } from "react";
import { makeMessagePairs, type MessagePair } from "./analyse";
import { Tooltip } from "~/components/ui/tooltip";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import type { Message, MessageChannel } from "libs/prisma";
import { getScoreColor } from "~/score";
import { Link as RouterLink } from "react-router";
import { ViewSwitch } from "./view-switch";
import { CountryFlag } from "./country-flag";
import { extractCitations } from "libs/citation";
import { SingleLineCell } from "~/components/single-line-cell";
import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      createdAt: {
        gte: ONE_WEEK_AGO,
      },
    },
    include: {
      thread: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let messagePairs = makeMessagePairs(messages);

  const url = new URL(request.url);
  const rating = url.searchParams.get("rating");
  if (rating) {
    messagePairs = messagePairs.filter(
      (pair) => pair.responseMessage.rating === rating
    );
  }

  const queryMessageId = url.searchParams.get("query-message-id");
  let messagePair = null;
  if (queryMessageId) {
    messagePair = messagePairs.find(
      (pair) => pair.queryMessage?.id === queryMessageId
    );
  }

  return { messagePairs, messagePair };
}

function getMessageContent(message?: Message) {
  return (message?.llmMessage as any)?.content ?? "-";
}

function ChannelIcon({ channel }: { channel?: MessageChannel | null }) {
  const [text, icon, color] = useMemo(() => {
    if (channel === "discord") {
      return ["Discord", TbBrandDiscord, "orange"];
    }
    if (channel === "mcp") {
      return ["MCP", TbRobotFace, "blue"];
    }
    if (channel === "slack") {
      return ["Slack", TbBrandSlack, "orange"];
    }
    return ["Chatbot", TbMessage, "brand"];
  }, [channel]);

  return (
    <Badge colorPalette={color} variant={"surface"}>
      <Icon as={icon} />
      {text}
    </Badge>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  const [hoveredUniqueId, setHoveredUniqueId] = useState<string | null>(null);
  const citation = useMemo(
    () => extractCitations(getMessageContent(message), message.links),
    [message]
  );

  return (
    <>
      <MarkdownProse
        sources={Object.values(citation.citedLinks).map((link) => ({
          title: link?.title ?? link?.url ?? "Source",
          url: link?.url ?? undefined,
        }))}
        options={{
          disabled: true,
          onSourceMouseEnter: (index) => {
            for (let i = 0; i < Object.keys(citation.citedLinks).length; i++) {
              if (
                citation.citedLinks[i].fetchUniqueId ===
                message.links[index].fetchUniqueId
              ) {
                setHoveredUniqueId(message.links[index].fetchUniqueId);
                break;
              }
            }
          },
          onSourceMouseLeave: () => setHoveredUniqueId(null),
        }}
      >
        {citation.content}
      </MarkdownProse>

      <Table.Root variant={"outline"}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Knowledge Item</Table.ColumnHeader>
            <Table.ColumnHeader>Query</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Score</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body background={"brand.white"}>
          {message.links.map((link, index) => (
            <Table.Row
              key={index}
              bg={
                hoveredUniqueId === link.fetchUniqueId
                  ? "brand.gray.100"
                  : "brand.white"
              }
            >
              <Table.Cell>
                <Group>
                  <Link
                    href={`/knowledge/item/${link.scrapeItemId}`}
                    target="_blank"
                  >
                    {link.title || link.url}
                  </Link>
                </Group>
              </Table.Cell>
              <Table.Cell>{link.searchQuery ?? "-"}</Table.Cell>
              <Table.Cell textAlign="end">
                <Badge
                  colorPalette={getScoreColor(link.score ?? 0)}
                  variant={"surface"}
                >
                  {link.score?.toFixed(2)}
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

function MessageDrawer({ messagePair }: { messagePair?: MessagePair | null }) {
  return (
    <Drawer.Root open={!!messagePair} size={"lg"}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>
                {(messagePair?.queryMessage?.llmMessage as any)?.content}
              </Drawer.Title>
              <Group mt={2}>
                <Text>
                  {moment(messagePair?.queryMessage?.createdAt).fromNow()}
                </Text>
                <ChannelIcon channel={messagePair?.queryMessage?.channel} />
                {messagePair?.queryMessage?.thread.location && (
                  <CountryFlag
                    location={messagePair?.queryMessage?.thread.location}
                  />
                )}
                {messagePair?.responseMessage.rating && (
                  <Rating rating={messagePair?.responseMessage.rating} />
                )}
              </Group>
            </Drawer.Header>
            <Drawer.Body>
              {messagePair && (
                <AssistantMessage message={messagePair.responseMessage} />
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline" asChild>
                <RouterLink to={`/messages`} replace>
                  Close
                </RouterLink>
              </Button>
              <Button asChild>
                <RouterLink
                  to={`/messages/${messagePair?.responseMessage?.id}/fix`}
                >
                  <TbSettingsBolt />
                  Correct it
                  {messagePair?.responseMessage.correctionItemId && " again"}
                </RouterLink>
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

function Rating({ rating }: { rating: Message["rating"] }) {
  if (!rating) return null;

  return (
    <Tooltip content="Rating from the user" showArrow>
      <Badge
        colorPalette={rating === "up" ? "green" : "red"}
        variant={"surface"}
      >
        {rating === "up" ? <TbThumbUp /> : <TbThumbDown />}
      </Badge>
    </Tooltip>
  );
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Messages" icon={<TbMessage />} right={<ViewSwitch />}>
      <Stack>
        {loaderData.messagePairs.length === 0 && (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <TbMessage />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No messages yet!</EmptyState.Title>
                <EmptyState.Description maxW={"lg"}>
                  Embed the chatbot, use MCP server or the Discord Bot to let
                  your customers talk with your documentation.
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        )}
        {loaderData.messagePairs.length > 0 && (
          <Stack>
            <Text opacity={0.5} mb={2}>
              Showing messages in last 7 days
            </Text>

            {loaderData.messagePairs.length === 0 && (
              <Center my={8} flexDir={"column"} gap={2}>
                <Text fontSize={"6xl"} opacity={0.5}>
                  <TbBox />
                </Text>
                <Text textAlign={"center"}>No messages for the filter</Text>
              </Center>
            )}

            {loaderData.messagePairs.length > 0 && (
              <Table.Root variant={"outline"} rounded={"sm"}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Question</Table.ColumnHeader>
                    <Table.ColumnHeader w={"100px"}></Table.ColumnHeader>
                    <Table.ColumnHeader w={"100px"}>Channel</Table.ColumnHeader>
                    <Table.ColumnHeader w={"60px"}>Score</Table.ColumnHeader>
                    <Table.ColumnHeader w={"140px"} textAlign={"end"}>
                      Time
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {loaderData.messagePairs.map((pair, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Link asChild>
                          <RouterLink
                            to={`/messages?query-message-id=${pair.queryMessage?.id}`}
                          >
                            <SingleLineCell tooltip={false}>
                              {getMessageContent(pair.queryMessage)}
                            </SingleLineCell>
                          </RouterLink>
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Group>
                          {pair.queryMessage?.thread.location && (
                            <CountryFlag
                              location={pair.queryMessage.thread.location}
                            />
                          )}
                          <Rating rating={pair.responseMessage.rating} />
                          {pair.responseMessage.correctionItemId && (
                            <Tooltip content="Corrected the answer" showArrow>
                              <Badge colorPalette={"brand"} variant={"surface"}>
                                <TbSettingsBolt />
                              </Badge>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Cell>
                      <Table.Cell>
                        <ChannelIcon channel={pair.queryMessage?.channel} />
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={getScoreColor(pair.maxScore)}
                          variant={"surface"}
                        >
                          {pair.maxScore.toFixed(2)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign={"end"}>
                        {moment(pair.queryMessage?.createdAt).fromNow()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Stack>
        )}
      </Stack>

      <MessageDrawer messagePair={loaderData.messagePair} />
    </Page>
  );
}
