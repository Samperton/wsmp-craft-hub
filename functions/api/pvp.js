// Handles GET requests (when a player visits mc.w-smp.org/pvp)
export async function onRequestGet(context) {
  try {
    // 1. Read the saved bracket from Cloudflare KV
    if (context.env.TOURNAMENT_KV) {
      const data = await context.env.TOURNAMENT_KV.get("bracket_data");
      if (data) {
        return new Response(data, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
    }

    // Default fallback state if no tournament has been run yet
    const fallback = {
      season: 1,
      active: false,
      status: "IDLE",
      podium: { first: null, second: null, third: null },
      roster: [],
      matches: [],
    };

    return new Response(JSON.stringify(fallback), {
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

// Handles POST requests (when the Minecraft plugin pushes match results)
export async function onRequestPost(context) {
  try {
    const authHeader = context.request.headers.get("Authorization") || "";
    // Checks for your secret token (matches plugin config.yml)
    const expectedSecret = context.env.PVP_SECRET || "wsmp_secret_token_here";

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = await context.request.json();

    // 2. Save payload into Cloudflare KV
    if (context.env.TOURNAMENT_KV) {
      await context.env.TOURNAMENT_KV.put("bracket_data", JSON.stringify(payload));
    } else {
      console.warn("TOURNAMENT_KV binding is missing in Cloudflare dashboard.");
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

// Handles browser CORS preflight checks
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
