import { Edit, Trash2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, CampaignStatus } from "./StatusBadge";
import { ApprovalIcons } from "./ApprovalIcons";

export interface Campaign {
  id: string;
  trackingNumber: string;
  supplier: string;
  winnersCount: number;
  total: number;
  status: CampaignStatus;
  approvals: {
    gerente: boolean | null;
    diretoria: boolean | null;
    dp: boolean | null;
  };
}

interface CampaignTableProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function CampaignTable({ campaigns, onEdit, onDelete, onExport }: CampaignTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Nº Acompanhamento</TableHead>
            <TableHead className="font-semibold">Fornecedor</TableHead>
            <TableHead className="font-semibold text-center">Quantidade de Ganhadores</TableHead>
            <TableHead className="font-semibold text-right">Total (R$)</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Autorizações</TableHead>
            <TableHead className="font-semibold text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{campaign.trackingNumber}</TableCell>
              <TableCell>{campaign.supplier}</TableCell>
              <TableCell className="text-center">{campaign.winnersCount}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(campaign.total)}</TableCell>
              <TableCell>
                <StatusBadge status={campaign.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <ApprovalIcons approvals={campaign.approvals} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(campaign)}
                    className="h-8 w-8 p-0 hover:bg-primary-light hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(campaign.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExport(campaign.id)}
                    className="h-8 w-8 p-0 hover:bg-success-light hover:text-success"
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
