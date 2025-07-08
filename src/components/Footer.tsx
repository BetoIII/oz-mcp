import Link from "next/link"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">OZ-MCP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Instant Opportunity Zone verification for smarter investment decisions.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Playground
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 OZ-MCP. All rights reserved.</p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            <Badge variant="secondary" className="text-xs">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              All systems operational
            </Badge>
            <span className="text-xs text-muted-foreground">Last updated: Dec 2024</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 