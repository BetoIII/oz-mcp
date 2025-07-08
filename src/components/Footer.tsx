import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex items-center justify-center">
                <Image src="/oz-mcp-pin-icon.png" alt="OZ-MCP Logo" width={35} height={35} className="object-contain" />
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
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} OZ-MCP. All rights reserved.</p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            <Badge variant="secondary" className="text-xs">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              All systems operational
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last deployed: {process.env.NEXT_PUBLIC_DEPLOYMENT_DATE 
                ? new Date(process.env.NEXT_PUBLIC_DEPLOYMENT_DATE).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })
                : 'Unknown'
              }
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
} 