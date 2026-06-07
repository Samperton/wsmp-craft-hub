import { useEffect, useRef, useState } from "react";
import { Globe2, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MAP_URL = "https://map.w-smp.org/#survival";

export default function WorldMapPanel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await wrapperRef.current.requestFullscreen();
      }
    } catch {
      // Browser blocked or unsupported; user can fall back to the open-in-new-tab link.
    }
  };

  return (
    <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-primary" />
          <h2 className="font-pixel text-lg md:text-xl text-slate-deep">3D World Map</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </a>
          </Button>
          <Button variant="default" size="sm" className="gap-2" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Exit fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className={
          isFullscreen
            ? "mt-0 w-full h-full bg-background"
            : "mt-6 relative aspect-video w-full rounded-xl border border-border overflow-hidden bg-secondary"
        }
      >
        <iframe
          src={MAP_URL}
          title="WSMP Live World Map"
          loading="lazy"
          allow="fullscreen"
          allowFullScreen
          className="w-full h-full border-0 block"
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Live world map streamed from map.w-smp.org.
      </p>
    </Card>
  );
}
