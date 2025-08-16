import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lead = {
      id: string;
      name: string;
      company: string;
      email: string;
      source: string;
      score: number;
      status: "new" | "converted";
};

export type Opportunity = {
      id: string;
      name: string;
      stage: string;
      amount?: number;
      accountName: string;
};

type LeadContextType = {
      leads: Lead[];
      opportunities: Opportunity[];
      isLoading: boolean;
      addLead: (lead: Lead) => Promise<void>;
      updateLead: (lead: Lead) => Promise<void>;
      deleteLeads: (ids: string[]) => Promise<void>;
      convertLead: (id: string) => Promise<void>;
      bulkAddLeads: (leads: Lead[]) => Promise<void>;
};

export const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider = ({ children }: { children: ReactNode }) => {
      const [leads, setLeads] = useState<Lead[]>([]);
      const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
      const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
            const fetchLeads = async () => {
                  setIsLoading(true);
                  await new Promise((resolve) => setTimeout(resolve, 2000));

                  const storedLeads = localStorage.getItem("leads");
                  const storedOpps = localStorage.getItem("opportunities");

                  if (storedLeads) setLeads(JSON.parse(storedLeads));
                  if (storedOpps) setOpportunities(JSON.parse(storedOpps));

                  setIsLoading(false);
            };

            fetchLeads();
      }, []);

      const persistLeads = (updatedLeads: Lead[]) =>
            localStorage.setItem("leads", JSON.stringify(updatedLeads));

      const persistOpportunities = (updatedOpps: Opportunity[]) =>
            localStorage.setItem("opportunities", JSON.stringify(updatedOpps));

      const addLead = async (lead: Lead) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLeads((prev) => {
                  const updated = [...prev, lead];
                  persistLeads(updated);
                  return updated;
            });

            setIsLoading(false);
      };

      const updateLead = async (updatedLead: Lead) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLeads((prev) => {
                  const updated = prev.map((lead) =>
                        lead.id === updatedLead.id ? updatedLead : lead
                  );
                  persistLeads(updated);
                  return updated;
            });

            setIsLoading(false);
      };

      const deleteLeads = async (ids: string[]) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 500));

            const updatedLeads = leads.filter((lead) => !ids.includes(lead.id));
            setLeads(updatedLeads);
            persistLeads(updatedLeads);

            setIsLoading(false);
      };

      const convertLead = async (id: string) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedLeads: Lead[] = leads.map((lead) =>
                  lead.id === id ? { ...lead, status: "converted" } : lead
            );
            setLeads(updatedLeads);
            persistLeads(updatedLeads);

            const lead = leads.find((l) => l.id === id);
            if (lead) {
                  const newOpportunity: Opportunity = {
                        id: new Date().toISOString(),
                        name: `Opportunity for ${lead.name}`,
                        stage: "Prospecting",
                        accountName: lead.company,
                  };
                  const updatedOpps = [...opportunities, newOpportunity];
                  setOpportunities(updatedOpps);
                  persistOpportunities(updatedOpps);
            }

            setIsLoading(false);
      };

      const bulkAddLeads = async (newLeads: Lead[]) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setLeads((prev) => {
                  const updated = [...prev, ...newLeads];
                  persistLeads(updated);
                  return updated;
            });

            setIsLoading(false);
      };

      return (
            <LeadContext.Provider
                  value={{
                        leads,
                        opportunities,
                        isLoading,
                        addLead,
                        updateLead,
                        deleteLeads,
                        convertLead,
                        bulkAddLeads,
                  }}
            >
                  {children}
            </LeadContext.Provider>
      );
};

export const useLeads = () => {
      const context = useContext(LeadContext);
      if (!context) throw new Error("useLeads must be used within a LeadProvider");
      return context;
};