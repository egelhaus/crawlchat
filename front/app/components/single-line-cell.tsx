import { Text } from "@chakra-ui/react";
import { Tooltip } from "./ui/tooltip";

export function SingleLineCell({
  children,
  tooltip = true,
}: {
  children: React.ReactNode;
  tooltip?: boolean;
}) {
  function render() {
    return <Text lineClamp={1}>{children}</Text>;
  }

  if (!tooltip) return render();

  return (
    <Tooltip
      showArrow
      content={children}
      positioning={{ placement: "bottom-start" }}
    >
      {render()}
    </Tooltip>
  );
}
