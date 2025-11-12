import { AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PreviewModeBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 border-b bg-yellow-500/10 border-yellow-500/20">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-600 font-semibold">Preview Mode - Mock Data</AlertTitle>
      <AlertDescription className="text-yellow-600/90">
        This app requires deployment to connect to a real PostgreSQL database. Currently showing mock data for
        demonstration.{" "}
        <a
          href="https://vercel.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline hover:text-yellow-700"
        >
          Deploy to Vercel <ExternalLink className="h-3 w-3" />
        </a>
      </AlertDescription>
    </Alert>
  )
}
