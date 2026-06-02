import { Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Placeholder for the 3D world map. Code-split so it isn't loaded until the
// dashboard's "3D World Map" toggle is explicitly selected.
export default function WorldMapPanel() {
  return (
    <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
      <div className="flex items-center gap-3">
        <Globe2 className="h-5 w-5 text-primary" />
        <h2 className="font-pixel text-lg md:text-xl text-slate-deep">3D World Map</h2>
      </div>
      <p className="mt-3 text-sm text-slate-soft">
        Interactive view of the WSMP world. The renderer initializes only when this view is active.
      </p>

      <div className="mt-6 relative aspect-video w-full rounded-xl border border-border bg-gradient-to-br from-secondary to-card overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
          <Globe2 className="h-16 w-16 text-primary/70" />
          <div>
            <div className="font-pixel text-sm text-slate-deep">Map placeholder</div>
            <div className="mt-1 text-xs text-slate-soft">
              The live 3D world renderer will mount here.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
