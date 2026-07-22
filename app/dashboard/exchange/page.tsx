"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ExchangePage() {
  return (
    <div className="mx-auto max-w-lg pt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-6 text-muted-foreground" />
            <div>
              <CardTitle>Not available</CardTitle>
              <CardDescription>
                Exchange features (shared mailboxes, distribution lists) are not available.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Microsoft Graph API does not properly differentiate shared mailboxes from
            distribution lists. Use the{" "}
            <a
              href="https://admin.exchange.microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              Exchange admin center
            </a>{" "}
            to manage these resources.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
