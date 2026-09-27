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

    const embed =
      data.kind === "bug"
        ? {
            title: "New Bug Report Submitted!",
            color: 0xaa00aa,
            fields: [
              { name: "Reporter", value: data.username, inline: true },
              { name: "Issue Title", value: data.title ?? "—", inline: true },
              { name: "Description Details", value: data.body },
            ],
          }
        : {
            title: "New Player Report Submitted!",
            color: 0xaa00aa,
            fields: [
              { name: "Reporter", value: data.username, inline: true },
              { name: "Reported Player", value: data.reported ?? "—", inline: true },
              { name: "Details", value: data.body },
            ],
          };

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username:
          data.kind === "bug" ? "Server Bug Tracker" : "Player Report Tracker",
        embeds: [embed],
        // Never render @everyone/@here/role pings from user input.
        allowed_mentions: { parse: [] },
      }),
    });

    if (!res.ok) {
      console.error(`[submitReport] Discord webhook returned ${res.status}`);
      throw new Error(`Discord webhook returned ${res.status}`);
    }

    return { ok: true };
  });
