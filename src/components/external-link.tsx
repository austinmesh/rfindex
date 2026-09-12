import type { ComponentPropsWithoutRef } from "react"

// The one place external links get their new-tab attributes. target="_blank"
// without rel="noopener noreferrer" hands window.opener (and the referrer) to
// the destination page, so the attributes are set after the prop spread and
// cannot be overridden by callers. Referral/affiliate attribution lives in URL
// query parameters and is unaffected. Build-time-sanitized commentary HTML gets
// the same rel via lib/prebuild.ts.
export function ExternalLink(props: ComponentPropsWithoutRef<"a">) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />
}
