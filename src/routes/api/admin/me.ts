import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated } from "@/lib/admin-session";

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async () => {
        const authenticated = await isAdminAuthenticated();
        return Response.json({ authenticated });
      },
    },
  },
});
