import { Page } from "~/components/page";
import { TbSettings } from "react-icons/tb";
import { Stack, Text } from "@chakra-ui/react";

export default function SettingsPage() {
  return (
    <Page title="Settings" icon={<TbSettings />}>
      <Stack>
        <Text>Settings</Text>
      </Stack>
    </Page>
  );
}
