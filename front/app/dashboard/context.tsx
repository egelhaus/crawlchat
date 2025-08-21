import type { Scrape, User } from "libs/prisma";
import { createContext, useState } from "react";
import type { SetupProgressAction } from "./setup-progress";

export const useApp = ({
  user,
  scrapeId,
}: {
  user: User;
  scrapeId?: string;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [progressActions, setProgressActions] = useState<SetupProgressAction[]>(
    []
  );

  return {
    user,
    menuOpen,
    setMenuOpen,
    containerWidth,
    setContainerWidth,
    scrapeId,
    progressActions,
    setProgressActions,
  };
};

export const AppContext = createContext({} as ReturnType<typeof useApp>);
