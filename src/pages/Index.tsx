import { useState } from "react";
import { Plus, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignTable, Campaign } from "@/components/CampaignTable";
import { NewCampaignDialog } from "@/components/NewCampaignDialog";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      trackingNumber: "NP-2025-001",
      supplier: "Tech Solutions Ltda",
      winnersCount: 5,
      total: 25000,
      status: "aprovado",
      approvals: {
        gerente: true,
        diretoria: true,
        dp: null,
      },
    },
    {
      id: "2",
      trackingNumber: "NP-2025-002",
      supplier: "Inovação Digital",
      winnersCount: 3,
      total: 15000,
      status: "em_andamento",
      approvals: {
        gerente: true,
        diretoria: null,
        dp: null,
      },
    },
    {
      id: "3",
      trackingNumber: "NP-2025-003",
      supplier: "Parceiros Comerciais",
      winnersCount: 8,
      total: 40000,
      status: "pago",
      approvals: {
        gerente: true,
        diretoria: true,
        dp: true,
      },
    },
  ]);

  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);

  const handleEdit = (campaign: Campaign) => {
    toast({
      title: "Editar Campanha",
      description: `Editando campanha ${campaign.trackingNumber}`,
    });
  };

  const handleDelete = (id: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
    toast({
      title: "Campanha excluída",
      description: "A campanha foi removida com sucesso.",
      variant: "destructive",
    });
  };

  const handleExport = (id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    toast({
      title: "Exportar",
      description: `Exportando dados da campanha ${campaign?.trackingNumber}`,
    });
  };

  const handleSaveNewCampaign = (data: any) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      trackingNumber: `NP-2025-${String(campaigns.length + 1).padStart(3, "0")}`,
      supplier: data.supplier,
      winnersCount: data.participants.length,
      total: data.total,
      status: "em_andamento",
      approvals: {
        gerente: null,
        diretoria: null,
        dp: null,
      },
    };

    setCampaigns([newCampaign, ...campaigns]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Nordil Premiações</h1>
                <p className="text-sm text-muted-foreground">Gestão de campanhas de incentivo</p>
              </div>
            </div>
            <Button
              onClick={() => setIsNewCampaignOpen(true)}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Nova Premiação
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <p className="text-sm text-muted-foreground font-medium">Total de Campanhas</p>
              <p className="text-3xl font-bold text-foreground mt-2">{campaigns.length}</p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <p className="text-sm text-muted-foreground font-medium">Em Andamento</p>
              <p className="text-3xl font-bold text-warning mt-2">
                {campaigns.filter((c) => c.status === "em_andamento").length}
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <p className="text-sm text-muted-foreground font-medium">Aprovadas</p>
              <p className="text-3xl font-bold text-success mt-2">
                {campaigns.filter((c) => c.status === "aprovado").length}
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <p className="text-sm text-muted-foreground font-medium">Valor Total</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 0,
                }).format(campaigns.reduce((sum, c) => sum + c.total, 0))}
              </p>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Campanhas de Premiação</h2>
              <p className="text-sm text-muted-foreground">
                {campaigns.length} {campaigns.length === 1 ? "campanha" : "campanhas"} cadastrada
                {campaigns.length !== 1 ? "s" : ""}
              </p>
            </div>
            <CampaignTable
              campaigns={campaigns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          </div>
        </div>
      </main>

      {/* New Campaign Dialog */}
      <NewCampaignDialog
        open={isNewCampaignOpen}
        onOpenChange={setIsNewCampaignOpen}
        onSave={handleSaveNewCampaign}
      />
    </div>
  );
};

export default Index;
