import { CheckCircle2, XCircle, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Approvals {
  gerente: boolean | null;
  diretoria: boolean | null;
  dp: boolean | null;
}

interface ApprovalIconsProps {
  approvals: Approvals;
}

export function ApprovalIcons({ approvals }: ApprovalIconsProps) {
  const renderIcon = (approved: boolean | null, label: string) => {
    if (approved === true) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CheckCircle2 className="w-5 h-5 text-success" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{label} - Aprovado</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (approved === false) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <XCircle className="w-5 h-5 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{label} - Recusado</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Circle className="w-5 h-5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{label} - Pendente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {renderIcon(approvals.gerente, "Gerente")}
      {renderIcon(approvals.diretoria, "Diretoria")}
      {renderIcon(approvals.dp, "DP")}
    </div>
  );
}
