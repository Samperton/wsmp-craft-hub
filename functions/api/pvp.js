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

    // Default to true so it reads live data
  const [useLiveApi, setUseLiveApi] = useState(true);

  // Poll the API every 5 seconds for live bracket updates
  useEffect(() => {
    if (!useLiveApi) return;

    const fetchTournamentData = () => {
      fetch('/api/pvp')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((json: TournamentData) => {
          // If live data has been sent by the server, update the screen
          if (json && (json.matches.length > 0 || json.roster.length > 0 || json.status !== 'IDLE')) {
            setData(json);
          }
        })
        .catch((err) => {
          console.warn('Live API unreachable, using preview data.', err);
        });
    };

    fetchTournamentData();
    const interval = setInterval(fetchTournamentData, 5000);
    return () => clearInterval(interval);
  }, [useLiveApi]);
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
