import { Center, Spinner } from "@chakra-ui/react";
import { vemetric } from "@vemetric/react";
import { useEffect } from "react";
import { type LoaderFunctionArgs } from "react-router";
import { destroySession, getSession } from "~/session";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  return Response.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    }
  );
}

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      await vemetric.resetUser();
      window.location.href = "/login";
    })();
  }, []);

  return (
    <Center w="100dvw" h="100dvh">
      <Spinner />
    </Center>
  );
}
