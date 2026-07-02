// Renders a schema.org JSON-LD block. Server-safe; drop it anywhere in a page's
// JSX. The data is serialized as-is, so only pass trusted, app-generated objects.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
