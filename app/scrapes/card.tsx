import { TbTrash } from "react-icons/tb";
import { TbCheck } from "react-icons/tb";
import { Badge, IconButton } from "@chakra-ui/react";
import { TbMessage } from "react-icons/tb";
import { Group, Text } from "@chakra-ui/react";
import { Stack } from "@chakra-ui/react";
import type { Scrape } from "@prisma/client";
import { useEffect, useState } from "react";
import { TbWorld } from "react-icons/tb";
import { Link } from "react-router";
import moment from "moment";

export function ScrapeCard({
  scrape,
  onDelete,
  deleting,
}: {
  scrape: Scrape;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const [deleteActive, setDeleteActive] = useState(false);

  useEffect(() => {
    if (deleteActive) {
      setTimeout(() => {
        setDeleteActive(false);
      }, 3000);
    }
  }, [deleteActive]);

  function handleDelete() {
    if (!deleteActive) {
      setDeleteActive(true);
      return;
    }
    if (onDelete) {
      onDelete();
    }
  }

  return (
    <Stack bg="brand.gray.100" p={4} rounded={"lg"} h="full" className="group">
      <Group h={"30px"}>
        <Text fontSize={"30px"} _groupHover={{ display: "none" }}>
          <TbWorld />
        </Text>
        <Group h="full" display={"none"} _groupHover={{ display: "flex" }}>
          <IconButton size={"xs"} asChild>
            <Link to={`/threads/new?id=${scrape.id}`}>
              <TbMessage />
            </Link>
          </IconButton>
          {onDelete && (
            <IconButton
              size={"xs"}
              variant={deleteActive ? "solid" : "subtle"}
              colorPalette={"red"}
              onClick={handleDelete}
            >
              {deleteActive ? <TbCheck /> : <TbTrash />}
            </IconButton>
          )}
        </Group>
      </Group>

      <Text fontSize={"sm"} lineClamp={2}>
        {scrape.url}
      </Text>
      <Group fontSize={"xs"}>
        <Text opacity={0.5}>{moment(scrape.createdAt).fromNow()}</Text>
        <Badge size={"xs"} variant={"surface"} colorPalette={"brand"}>
          <TbWorld />
          {scrape.urlCount}
        </Badge>
      </Group>
    </Stack>
  );
}
