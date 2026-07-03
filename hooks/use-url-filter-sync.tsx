"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// Leaf that subscribes to App Router URL changes and reports the router's
// query string. Isolated behind its own Suspense boundary (see useUrlFilterSync
// below) so the client-side-rendering bailout from useSearchParams() stops here
// instead of climbing to the page and dropping the server-rendered card grid
// from the static HTML (the bug PR-B fixed). Renders nothing.
function SearchParamsListener({ onChange }: { onChange: (search: string) => void }) {
  const search = useSearchParams().toString()
  useEffect(() => {
    onChange(search)
  }, [search, onChange])
  return null
}

// Parse an integer URL param, falling back when the param is missing or not a
// number (e.g. a hand-mangled ?priceMax=abc). Without the NaN guard, a bad
// value would poison every numeric comparison and silently hide all results.
export function parseIntParam(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

type UrlFilterSyncOptions = {
  /**
   * Set filter state from the given URL params. MUST be identity-stable
   * (useCallback) or the mount sync re-fires every render and array-valued
   * setState calls loop forever.
   */
  applyParams: (params: URLSearchParams) => void
  /**
   * Write filter state into the given URL params: set keys for active
   * filters, delete keys for inactive ones, leave unrelated params alone.
   * Wrap in useCallback with the filter state as deps; the identity change
   * is what triggers the URL-write effect.
   */
  serializeParams: (params: URLSearchParams) => void
}

/**
 * Two-way sync between filter state and the URL query string, shared by
 * DeviceFilters and AntennaFilters so their back/forward, deep-link, and
 * same-route navigation behavior cannot drift apart.
 *
 * The consuming component must NOT call useSearchParams() during render:
 * that deopts the listing page's static prerender and strips every crawlable
 * detail link from the HTML. This hook keeps the subscription in a
 * Suspense-isolated leaf (returned as `listener`; render it anywhere in the
 * component's tree) that renders nothing.
 *
 * URL -> state: applied after mount and whenever the URL changes under the
 * mounted component: browser back/forward, and same-route <Link> navigations
 * (pushState fires no popstate event, but it does update useSearchParams,
 * which the listener leaf observes).
 *
 * state -> URL: router.replace on state change, gated until the first
 * URL -> state application so the initial default-state commit cannot
 * clobber deep-link params, and skipped when nothing changed.
 *
 * Both directions sync against `searchRef`, the last query string state was
 * reconciled with. Do NOT compare against window.location instead: during
 * client navigations App Router commits the new searchParams before it
 * updates history, so reading window.location from the listener's effect
 * re-applies the OLD query string and rewrites the URL back to the stale
 * filters (the same-route <Link> desync this hook exists to fix). The ref
 * also dedupes our own replace() echoes, so a state write does not bounce
 * back through applyParams.
 */
export function useUrlFilterSync({ applyParams, serializeParams }: UrlFilterSyncOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)

  // Last query string (URLSearchParams-normalized, no leading "?") that
  // filter state was reconciled with, whether applied from the router or
  // written by us. null until the first sync.
  const searchRef = useRef<string | null>(null)

  const syncFromSearch = useCallback(
    (search: string) => {
      if (search !== searchRef.current) {
        searchRef.current = search
        applyParams(new URLSearchParams(search))
      }
      setHydrated(true)
    },
    [applyParams],
  )

  // Hydrate from the URL after mount, then allow URL writes. The listener
  // leaf also fires once on mount; syncFromSearch dedupes via searchRef, so
  // effect ordering between parent and child is irrelevant. Normalized
  // through URLSearchParams so it compares equal to router-produced strings.
  useEffect(() => {
    syncFromSearch(new URLSearchParams(window.location.search).toString())
  }, [syncFromSearch])

  // Write state to the URL when filters change (post-hydration). Building on
  // the last synced params preserves unrelated query params; skipping the
  // no-change case avoids a wasted App Router state update on every mount.
  useEffect(() => {
    if (!hydrated) return
    const params = new URLSearchParams(searchRef.current ?? "")
    serializeParams(params)
    const next = params.toString()
    if (next === searchRef.current) return
    searchRef.current = next
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [hydrated, serializeParams, pathname, router])

  const listener = (
    <Suspense fallback={null}>
      <SearchParamsListener onChange={syncFromSearch} />
    </Suspense>
  )

  return { hydrated, listener }
}
