import { Badge } from "@/components/ui/badge";

export type CampaignStatus = "em_andamento" | "aprovado" | "pago" | "encerrado";

interface StatusBadgeProps {
  status: CampaignStatus;
}

const statusConfig: Record<CampaignStatus, { label: string; variant: string; className: string }> = {
  em_andamento: {
    label: "Em Andamento",
    variant: "default",
    className: "bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20",
  },
  aprovado: {
    label: "Aprovado",
    variant: "default",
    className: "bg-success-light text-success-foreground border-success/20 hover:bg-success/20",
  },
  pago: {
    label: "Pago",
    variant: "default",
    className: "bg-primary-light text-primary border-primary/20 hover:bg-primary/20",
  },
  encerrado: {
    label: "Encerrado",
    variant: "outline",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label}
    </Badge>
  );
}
