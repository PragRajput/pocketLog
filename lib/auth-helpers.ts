import { cache } from "react";
import { auth } from "@/auth";

// Memoized per request: the dashboard calls this from several server actions
// at once, and without caching each one re-decrypts the session JWT.
export const requireUserId = cache(async (): Promise<string> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new Error("Not authenticated");
  return id;
});
