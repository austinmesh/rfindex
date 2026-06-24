# Mesh Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the site from Meshtastic-only to multi-firmware mesh platform, moving routes under `/mesh/`, adding firmware filtering, and creating SEO landing pages.

**Architecture:** Routes move from `/meshtastic/` to `/mesh/`. A new `supported_firmware` field on devices enables firmware filtering. SEO landing pages at `/mesh/meshtastic/` and `/mesh/meshcore/` provide content-rich entry points. 301 redirects in `next.config.mjs` preserve existing SEO. The nav updates from "Meshtastic" to "Mesh" dropdown.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui

---

### Task 1: Add `supported_firmware` to Device Data Layer (rfindex-data)

**Files:**
- Modify: `rfindex-data/schemas/meshtastic_devices.json`
- Modify: `rfindex-data/admin/config.yml`
- Modify: all 57 device JSON files in `rfindex-data/data/meshtastic_devices/`

**Context:** Every device needs a `supported_firmware` array field. For now, all existing devices support `["Meshtastic"]`. Some also support `["Meshtastic", "MeshCore"]`. For the initial migration, tag all devices with `["Meshtastic"]` — the user can update individual devices with MeshCore support later.

**Step 1: Add to JSON schema**

In `rfindex-data/schemas/meshtastic_devices.json`, add `supported_firmware` to the `properties` object and the `required` array:

```json
"supported_firmware": {
  "type": "array",
  "items": {
    "type": "string",
    "enum": ["Meshtastic", "MeshCore"]
  },
  "minItems": 1
}
```

Add `"supported_firmware"` to the `required` array.

**Step 2: Add to CMS config**

In `rfindex-data/admin/config.yml`, add to the `meshtastic_devices` collection fields:

```yaml
      - label: "Supported Firmware"
        name: "supported_firmware"
        widget: "select"
        options: ["Meshtastic", "MeshCore"]
        multiple: true
```

**Step 3: Add field to all 57 device JSON files**

Write a one-off script to add `"supported_firmware": ["Meshtastic"]` to every device JSON file in `data/meshtastic_devices/`. Add the field right after the `id` field for consistency.

Run: `cd /Users/tekstrand/git-repos/rfindex-data && node -e "...script..."`

**Step 4: Run validation**

Run: `cd /Users/tekstrand/git-repos/rfindex-data && npm test`
Expected: `All files passed.`

**Step 5: Commit and push**

```bash
cd /Users/tekstrand/git-repos/rfindex-data
git add schemas/meshtastic_devices.json admin/config.yml data/meshtastic_devices/
git commit -m "feat: add supported_firmware field to all devices"
git push
```

---

### Task 2: Update Device Type and Prebuild in rfindex

**Files:**
- Modify: `rfindex/types/device.ts`
- Modify: `rfindex/lib/prebuild.ts`
- Modify: `rfindex/lib/data.ts`

**Context:** The `Device` TypeScript type needs the new `supported_firmware` field. The prebuild script needs to pass it through. A new `allFirmwares` derived constant is needed for the filter.

**Step 1: Update Device type**

In `types/device.ts`, add to the `Device` type:

```typescript
export type Device = {
  id: string
  name: string
  manufacturer: string
  model: string
  description: string
  category: string[]
  image_url: string[]
  purchase_urls: PurchaseUrl[]
  price: DevicePrice
  specifications: DeviceSpecifications
  features: string[]
  supported_firmware: string[]
}
```

**Step 2: Update prebuild script**

In `lib/prebuild.ts`, add `supported_firmware` to the `RawDevice` type:

```typescript
type RawDevice = {
  // ... existing fields ...
  supported_firmware: string[]
}
```

And add to the `mapRawDevice` function return:

```typescript
supported_firmware: raw.supported_firmware,
```

**Step 3: Add allFirmwares to lib/data.ts**

```typescript
export const allFirmwares = Array.from(
  new Set(devices.flatMap((device) => device.supported_firmware)),
).sort()
```

**Step 4: Update submodule and test**

```bash
cd /Users/tekstrand/git-repos/rfindex
git submodule update --remote rfindex-data
npx tsx lib/prebuild.ts
npm run build
```

Expected: Build passes with all pages generated.

**Step 5: Commit**

```bash
git add types/device.ts lib/prebuild.ts lib/data.ts rfindex-data
git commit -m "feat: add supported_firmware field to device type and prebuild"
```

---

### Task 3: Add Firmware Filter to Device Filters Component

**Files:**
- Modify: `rfindex/components/device-filters.tsx`
- Modify: `rfindex/lib/data.ts` (import)

**Context:** Add a "Firmware" filter section to `device-filters.tsx`. Follow the exact same pattern as the existing microcontroller filter: state variable, URL param sync, filter logic, checkbox UI in both desktop and mobile views.

**Step 1: Add import**

Add `allFirmwares` to the import from `@/lib/data`:

```typescript
import { allDeviceCategories as allCategories, allFeatures, allLoraFrequencies, allMicrocontrollers, allFirmwares } from "@/lib/data"
```

**Step 2: Add state variable**

After the `selectedMicrocontrollers` state (~line 44):

```typescript
const [selectedFirmwares, setSelectedFirmwares] = useState<string[]>(
  searchParams.get("firmware")?.split(",").filter(Boolean) || [],
)
```

**Step 3: Add filter logic**

In the `filteredDevices` useMemo chain (~line 86), add after the microcontroller check:

```typescript
(selectedFirmwares.length === 0 || device.supported_firmware.some((fw) => selectedFirmwares.includes(fw)))
```

**Step 4: Add toggle handler**

After the microcontroller toggle (~line 146):

```typescript
const toggleFirmware = (firmware: string) =>
  setSelectedFirmwares((prev) =>
    prev.includes(firmware) ? prev.filter((f) => f !== firmware) : [...prev, firmware],
  )
```

**Step 5: Add to hasActiveFilters check**

Add `selectedFirmwares.length > 0` to the `hasActiveFilters` expression (~line 205).

**Step 6: Add URL sync**

In the URL update effect, add:
```typescript
if (selectedFirmwares.length > 0) params.set("firmware", selectedFirmwares.join(","))
```

Add `selectedFirmwares` to the effect dependency array.

In the popstate handler, add:
```typescript
setSelectedFirmwares(params.get("firmware")?.split(",").filter(Boolean) || [])
```

**Step 7: Add UI — desktop sidebar**

Add a "Firmware" section in the desktop filter sidebar (before or after the microcontroller section), following the same checkbox pattern:

```tsx
<div>
  <h3 className="font-medium mb-2">Firmware</h3>
  <div className="space-y-2">
    {allFirmwares.map((firmware) => (
      <label key={firmware} className="flex items-center space-x-2 cursor-pointer">
        <Checkbox
          checked={selectedFirmwares.includes(firmware)}
          onCheckedChange={() => toggleFirmware(firmware)}
        />
        <span className="text-sm">{firmware}</span>
      </label>
    ))}
  </div>
</div>
```

**Step 8: Add UI — mobile filter sheet**

Add the same firmware section in the mobile filter sheet, following the pattern of the other mobile filter sections.

**Step 9: Add to reset filters**

In the reset function, add `setSelectedFirmwares([])`.

**Step 10: Build and verify**

Run: `npm run build`
Expected: Build passes.

**Step 11: Commit**

```bash
git add components/device-filters.tsx
git commit -m "feat: add firmware filter to device listing"
```

---

### Task 4: Move Routes from `/meshtastic/` to `/mesh/`

**Files:**
- Move: `app/meshtastic/devices/` → `app/mesh/devices/`
- Move: `app/meshtastic/antennas/` → `app/mesh/antennas/`
- Delete: `app/meshtastic/page.tsx` (will be recreated as SEO landing page in Task 6)

**Context:** Move the page files, update all internal links (`/meshtastic/devices` → `/mesh/devices`), update canonical URLs, update metadata. The old `/meshtastic/` hub page gets removed — it will be replaced by an SEO landing page at `/mesh/meshtastic/` in Task 6.

**Step 1: Create directory structure**

```bash
mkdir -p app/mesh/devices/\[id\]
mkdir -p app/mesh/antennas/\[id\]
```

**Step 2: Move files**

```bash
git mv app/meshtastic/devices/page.tsx app/mesh/devices/page.tsx
git mv app/meshtastic/devices/\[id\]/page.tsx app/mesh/devices/\[id\]/page.tsx
git mv app/meshtastic/antennas/page.tsx app/mesh/antennas/page.tsx
git mv app/meshtastic/antennas/\[id\]/page.tsx app/mesh/antennas/\[id\]/page.tsx
git rm app/meshtastic/page.tsx
```

Then remove the now-empty `app/meshtastic/` directory.

**Step 3: Update all internal links and canonicals in moved files**

In `app/mesh/devices/page.tsx`:
- Title: `"Mesh Devices - Hardware Comparison | RF Index"`
- Description: update to mention mesh devices generally
- Canonical: `https://rfindex.com/mesh/devices`
- H1: `"Compare Mesh Devices"`
- Subtitle: `"Browse and compare devices compatible with mesh networking firmware."`

In `app/mesh/devices/[id]/page.tsx`:
- All `href="/meshtastic/devices"` → `href="/mesh/devices"`
- Canonical: `https://www.rfindex.com/mesh/devices/${id}`
- Title: `${device.name} by ${device.manufacturer} | Mesh Devices | RF Index`
- Not-found canonical: `https://www.rfindex.com/mesh/devices`

In `app/mesh/antennas/page.tsx`:
- Title: `"Compare Mesh Antennas | RF Index"`
- Description: update to mention mesh antennas generally
- Canonical: `https://rfindex.com/mesh/antennas`
- H1: `"Mesh Antennas"`
- Subtitle: update to say mesh devices instead of Meshtastic devices

In `app/mesh/antennas/[id]/page.tsx`:
- All `href="/meshtastic/antennas"` → `href="/mesh/antennas"`
- Canonical: `https://www.rfindex.com/mesh/antennas/${id}`
- Title: `${antenna.title} | Mesh Antennas | RF Index`
- Not-found canonical: `https://www.rfindex.com/mesh/antennas`

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build passes with all pages at new routes.

**Step 5: Commit**

```bash
git add app/mesh/ app/meshtastic/
git commit -m "refactor: move routes from /meshtastic/ to /mesh/"
```

---

### Task 5: Add 301 Redirects

**Files:**
- Modify: `rfindex/next.config.mjs`

**Context:** Add `redirects()` function to preserve SEO equity for all old URLs. Next.js handles these at the server level.

**Step 1: Add redirects to next.config.mjs**

Add the `redirects` function to the `nextConfig` object:

```javascript
const nextConfig = {
  // ... existing config ...
  async redirects() {
    return [
      { source: '/meshtastic/devices', destination: '/mesh/devices', permanent: true },
      { source: '/meshtastic/devices/:id', destination: '/mesh/devices/:id', permanent: true },
      { source: '/meshtastic/antennas', destination: '/mesh/antennas', permanent: true },
      { source: '/meshtastic/antennas/:id', destination: '/mesh/antennas/:id', permanent: true },
      { source: '/meshtastic', destination: '/mesh/meshtastic', permanent: true },
      { source: '/mesh', destination: '/mesh/devices', permanent: true },
    ]
  },
}
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build passes.

**Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat: add 301 redirects from /meshtastic/ to /mesh/"
```

---

### Task 6: Create SEO Landing Pages

**Files:**
- Create: `app/mesh/meshtastic/page.tsx`
- Create: `app/mesh/meshcore/page.tsx`

**Context:** These are content-rich pages for organic search. Each has: hero section, "what is X" content, key features, getting started, preview grid of popular devices for that firmware, and CTA to the filtered device listing. The Meshtastic page can be adapted from the existing `app/meshtastic/page.tsx` content.

**Step 1: Create Meshtastic landing page**

Create `app/mesh/meshtastic/page.tsx`. Adapt the content from the old `/meshtastic/page.tsx`:
- Hero with "Meshtastic" title and description
- "What is Meshtastic?" section with features and use cases
- Getting started section
- Preview grid: show first 6 devices where `supported_firmware.includes("Meshtastic")`, with cards linking to `/mesh/devices/[id]`
- CTA: "View all Meshtastic devices" linking to `/mesh/devices/?firmware=Meshtastic`
- Canonical: `https://www.rfindex.com/mesh/meshtastic`
- Title: `"Meshtastic - Off-Grid Communication Platform | RF Index"`

Import `devices` from `@/lib/data` to render the preview grid. Filter to `device.supported_firmware.includes("Meshtastic")` and take first 6.

**Step 2: Create MeshCore landing page**

Create `app/mesh/meshcore/page.tsx`. Similar structure:
- Hero with "MeshCore" title and description
- "What is MeshCore?" section — MeshCore is an alternative firmware for LoRa mesh devices focused on managed mesh networking with repeaters and room-based messaging
- Key features of MeshCore
- Preview grid of MeshCore-compatible devices
- CTA: "View all MeshCore devices" linking to `/mesh/devices/?firmware=MeshCore`
- Canonical: `https://www.rfindex.com/mesh/meshcore`
- Title: `"MeshCore - Managed Mesh Networking | RF Index"`

**Step 3: Build and verify**

Run: `npm run build`
Expected: Build passes with new landing pages.

**Step 4: Commit**

```bash
git add app/mesh/meshtastic/page.tsx app/mesh/meshcore/page.tsx
git commit -m "feat: add Meshtastic and MeshCore SEO landing pages"
```

---

### Task 7: Update Navigation Header

**Files:**
- Modify: `rfindex/components/site-header.tsx`

**Context:** Change the "Meshtastic" dropdown to "Mesh" with new links.

**Step 1: Update mainNavLinks**

Change the nav links from:

```typescript
{
  label: "Meshtastic",
  children: [
    { href: "/meshtastic", label: "Overview" },
    { href: "/meshtastic/devices", label: "Devices" },
    { href: "/meshtastic/antennas", label: "Antennas" },
  ],
},
```

To:

```typescript
{
  label: "Mesh",
  children: [
    { href: "/mesh/devices", label: "Devices" },
    { href: "/mesh/antennas", label: "Antennas" },
    { href: "/mesh/meshtastic", label: "Meshtastic" },
    { href: "/mesh/meshcore", label: "MeshCore" },
  ],
},
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build passes.

**Step 3: Commit**

```bash
git add components/site-header.tsx
git commit -m "feat: update nav from Meshtastic to Mesh dropdown"
```

---

### Task 8: Update Sitemap and Home Page

**Files:**
- Modify: `rfindex/app/sitemap.ts`
- Modify: `rfindex/app/page.tsx`

**Context:** The sitemap still references `/meshtastic/` URLs. The home page links to `/meshtastic`. Both need updating.

**Step 1: Update sitemap.ts**

Change all `/meshtastic/` references to `/mesh/`:

```typescript
{ url: `${baseUrl}/mesh/meshtastic`, ... priority: 0.9 },
{ url: `${baseUrl}/mesh/meshcore`, ... priority: 0.9 },
{ url: `${baseUrl}/mesh/devices`, ... priority: 0.8 },
{ url: `${baseUrl}/mesh/antennas`, ... priority: 0.8 },
// ...
{ url: `${baseUrl}/mesh/devices/${device.id}`, ... },
{ url: `${baseUrl}/mesh/antennas/${antenna.id}`, ... },
```

**Step 2: Update home page**

In `app/page.tsx`, change the Meshtastic card's link from `/meshtastic` to `/mesh/devices` (since `/mesh/` redirects to `/mesh/devices/` anyway, link directly).

**Step 3: Build and verify**

Run: `npm run build`
Expected: Build passes.

**Step 4: Commit**

```bash
git add app/sitemap.ts app/page.tsx
git commit -m "feat: update sitemap and home page for mesh routes"
```

---

### Task 9: Update CLAUDE.md and Push

**Files:**
- Modify: `rfindex/CLAUDE.md`

**Context:** Update the routing documentation, data layer references, and conventions to reflect the new `/mesh/` structure.

**Step 1: Update CLAUDE.md**

Update the routing section to show the new `app/mesh/` structure. Update the "Adding Data" section. Mention the `supported_firmware` field. Update any remaining `/meshtastic/` references.

**Step 2: Final build verification**

Run: `npm run build`
Expected: Build passes — all pages generated at new routes.

**Step 3: Commit and push**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for mesh restructure"
git push
```
