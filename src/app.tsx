import { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Leads } from "./pages/leads";
import { Opportunities } from "./pages/opportunities";
import { LeadContext } from "./context/lead-context";
import { ThemeButton } from "./components/theme-button";

export function App() {
  const context = useContext(LeadContext)
  const leadsSize = context?.leads?.length || 0
  const opportunitiesSize = context?.opportunities?.length || 0
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-2">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Mini Seller Console</h1>
            <p className="text-muted-foreground">Create, modify and convert your leads!</p>
          </div>

          <div className="ml-auto my-auto">
            <ThemeButton />
          </div>
        </div>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="leads">
              <span>Leads</span>
              <div className="rounded-full bg-accent-foreground text-accent w-max px-1 min-w-6">{leadsSize}</div>
            </TabsTrigger>
            <TabsTrigger value="oportunities">
              <span>Oportunities</span>
              <div className="rounded-full bg-accent-foreground text-accent w-max px-1 min-w-6">{opportunitiesSize}</div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <Leads />
          </TabsContent>

          <TabsContent value="oportunities" className="mt-6">
            <Opportunities />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}