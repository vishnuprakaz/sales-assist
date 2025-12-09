import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <span className="font-bold">No-CRM</span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search placeholder */}
            </div>
            <nav className="flex items-center">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-16 border-r border-border bg-muted/40">
          <div className="flex h-full flex-col">
            <div className="flex flex-col items-center space-y-4 py-4">
              <Button variant="ghost" size="sm" className="w-10 h-10">
                🏠
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10">
                👥
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to No-CRM</CardTitle>
                <CardDescription>
                  Your conversational lead management system is ready to go!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Start by adding leads or asking questions like "Show me my leads" or "Research this contact".
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Input Box - Always visible at bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
          <input
            type="text"
            placeholder="Ask anything or add a lead..."
            className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>
    </div>
  )
}

export default App