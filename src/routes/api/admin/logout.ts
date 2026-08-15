import { createFileRoute } from "@tanstack/react-router";
import { getAdminSession } from "@/lib/admin-session";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () => {
        const session = await getAdminSession();
        await session.clear();
        return Response.json({ ok: true });
      },
    },
  },
});
