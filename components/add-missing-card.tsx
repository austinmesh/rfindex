import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink } from "@/components/external-link"

// Persistent call-to-action card shown as the last item in the device,
// antenna, and filter listings, including when a filter yields zero results.
// Links to the "Add a device or antenna" issue template (which covers all
// hardware suggestions).
export function AddMissingCard({ type }: { type: "device" | "antenna" | "filter" }) {
  const article = type === "antenna" ? "an" : "a"
  return (
    <Card className="flex flex-col items-center justify-center text-center border-dashed p-6 min-h-[300px]">
      <PlusCircle className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg">Missing {article} {type}?</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Know {article} {type} that should be listed here? Suggest it and we will add it.
      </p>
      <div className="flex flex-col items-center gap-2">
        <Button asChild size="sm">
          <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=add-device.yml">
            Add {article} {type}
          </ExternalLink>
        </Button>
        {(type === "antenna" || type === "filter") && (
          <Button asChild variant="outline" size="sm">
            <ExternalLink href="https://github.com/austinmesh/rfindex/issues/new?template=submit-antenna-test.yml">
              Submit test data
            </ExternalLink>
          </Button>
        )}
      </div>
    </Card>
  )
}
