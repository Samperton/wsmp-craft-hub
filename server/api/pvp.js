export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env || {};
  const method = getMethod(event);

  // GET: Returns tournament/bracket data to the website or browser
  if (method === "GET") {
    if (env.TOURNAMENT_KV) {
      const data = await env.TOURNAMENT_KV.get("bracket_data");
      if (data) {
        setHeader(event, "Content-Type", "application/json");
        setHeader(event, "Access-Control-Allow-Origin", "*");
        setHeader(event, "Cache-Control", "no-cache");
        return data;
      }
    }

    // Default fallback state (matches your existing pvp.js fallback)
    return {
      season: 1,
      active: false,
      status: "IDLE",
      podium: { first: null, second: null, third: null },
      roster: [],
      matches: [],
    };
  }

  // POST: Receives live tournament updates from your Minecraft server
  if (method === "POST") {
    const auth = getHeader(event, "authorization") || "";
    const expectedToken = env.AUTH_BEARER_TOKEN;

    if (expectedToken && auth !== `Bearer ${expectedToken}`) {
      setResponseStatus(event, 401);
      return { error: "Unauthorized" };
    }

    const body = await readRawBody(event);
    if (env.TOURNAMENT_KV && body) {
      await env.TOURNAMENT_KV.put("bracket_data", body);
    }

    return { success: true };
  }
});
