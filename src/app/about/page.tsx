import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "About RF Index | Your Resource for RF Device Comparisons",
  description: "Learn about RF Index, a passion project created to help compare RF devices like Meshtastic and more.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">About RF Index</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg mb-6">
                RF Index is a passion project developed by the Austin Mesh community. It was born out of repeated questions in our Discord server about "which device is better" and "what's the difference between RAK and Heltec?". We hope that you find this tool useful, and will consider contributing your own experiences and information to help the site grow.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">How do you make money</h2>

              <p className="text-lg mb-6">
                Really we don't. This is a hobby, and we generally spend quite a bit out of pocket. To make up for this, some(most, probably) of the links on the site here are affiliate links. It doesn't cost you anything extra and we get to share in the profits with the manufacturers/retailers.
              </p>

              <p className="text-lg font-medium mb-6">
                We do not collect or sell your data. Data may be collected by the affiliates if you follow their links, but Austin Mesh/RF Index does not have access to or interest in collecting your information.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
