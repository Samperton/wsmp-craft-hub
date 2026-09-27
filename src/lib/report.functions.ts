import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reportSchema = z.object({
  kind: z.enum(["bug", "player"]),
  username: z.string().min(1).max(64),
  title: z.string().max(120).optional(),
  reported: z.string().max(64).optional(),
  body: z.string().min(1).max(2000),
});

export const submitReport = createServerFn({ method: "POST" })
  .inputValidator((data) => reportSchema.parse(data))
  .handler(async ({ data }) => {
    const webhook = process.env["DISCORD_WEBHOOK_URL"];
    if (!webhook) {
      throw new Error("Reports are not configured on the server.");
    }

    const content =
      data.kind === "bug"
        ? `**New Bug Report Submitted!**\n\n**Reporter:** ${data.username}\n**Issue Title:** ${data.title}\n**Description Details:**\n${data.body}`
        : `**New Player Report Submitted!**\n\n**Reporter:** ${data.username}\n**Reported Player:** ${data.reported}\n**Details:**\n${data.body}`;

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username:
          data.kind === "bug" ? "Server Bug Tracker" : "Player Report Tracker",
        content,
      }),
    });

    if (!res.ok) {
      throw new Error(`Discord webhook returned ${res.status}`);
    }

    return { ok: true };
  });
