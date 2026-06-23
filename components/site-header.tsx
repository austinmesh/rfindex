"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const mainNavLinks = [
    { href: "/", label: "Home" },
    {
      label: "Mesh",
      children: [
        { href: "/mesh/devices", label: "All Devices" },
        { href: "/mesh/antennas", label: "Antennas" },
        { href: "/mesh/devices", label: "Meshtastic" },
        { href: "/mesh/devices", label: "MeshCore" },
      ],
    },
    { href: "https://www.austinmesh.org", label: "Austin Mesh", target: "_blank" },
    { href: "https://forms.gle/CNUbVP5eUTqZNsdX6", label: "Contribute", target: "_blank" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="sticky top-0 z-[49] w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center min-w-0">
          <Image
            src="/Austin-Mesh-RF-Index-Logo.svg"
            alt="RF Index / Austin Mesh"
            width={447}
            height={40}
            className="h-6 w-auto max-w-full object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {mainNavLinks.map((link, index) =>
            link.children ? (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 px-2">
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {link.children.map((childLink, childIndex) => (
                    <DropdownMenuItem key={childIndex} asChild>
                      <Link href={childLink.href}>{childLink.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={index}
                href={link.href}
                {...(link.target && { target: link.target })}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col space-y-4 mt-8">
              {mainNavLinks.map((link, index) =>
                link.children ? (
                  <div key={index} className="space-y-2">
                    <div className="font-medium text-lg">{link.label}</div>
                    <div className="pl-4 space-y-2 border-l">
                      {link.children.map((childLink, childIndex) => (
                        <Link
                          key={childIndex}
                          href={childLink.href}
                          className="block text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {childLink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={index}
                    href={link.href}
                    {...(link.target && { target: link.target })}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
