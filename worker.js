import { onRequestGet } from "./functions/api/pvp.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Intercept API calls before they reach the website
    if (url.pathname === "/api/pvp" || url.pathname === "/api/bracket") {
      if (request.method === "GET") {
        return onRequestGet({ request, env, params: {} });
      }

      // Handle tournament updates from your Minecraft server plugin
      if (request.method === "POST") {
        const authHeader = request.headers.get("Authorization") || "";
        const expectedToken = env.AUTH_BEARER_TOKEN || env.AUTH_TOKEN;

        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const body = await request.text();
          if (env.TOURNAMENT_KV) {
            await env.TOURNAMENT_KV.put("bracket_data", body);
          }
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    // Pass everything else to your website frontend
    return env.ASSETS.fetch(request);
  },
};
