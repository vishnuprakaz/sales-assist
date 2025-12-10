import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/layout"

function App() {
  return (
    <AppLayout pageName="dashboard">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome to No-CRM</CardTitle>
            <CardDescription className="text-base">
              Your conversational lead management system is ready to go!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-base">
              Start by adding leads or asking questions like "Show me my leads" or "Research this contact".
            </p>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <p className="text-sm">
                <span className="text-lg mr-2">✨</span>
                <strong className="text-foreground">Context Tracking:</strong>{" "}
                <span className="text-muted-foreground">The system now tracks what you're viewing and doing</span>
              </p>
              <p className="text-sm">
                <span className="text-lg mr-2">⌨️</span>
                <strong className="text-foreground">Keyboard Shortcut:</strong>{" "}
                <span className="text-muted-foreground">Press Cmd+K (or Ctrl+K) to focus the input box</span>
              </p>
              <p className="text-sm">
                <span className="text-lg mr-2">🤖</span>
                <strong className="text-foreground">Natural Language:</strong>{" "}
                <span className="text-muted-foreground">Type commands like "go to leads" or "switch to dark mode"</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default App