import { useState } from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  role: string;
  email: string;
  amount: number;
}

interface NewCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function NewCampaignDialog({ open, onOpenChange, onSave }: NewCampaignDialogProps) {
  const [supplier, setSupplier] = useState("");
  const [budgetNumber, setBudgetNumber] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", role: "", email: "", amount: 0 },
  ]);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: "", role: "", email: "", amount: 0 },
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id));
    }
  };

  const updateParticipant = (id: string, field: keyof Participant, value: any) => {
    setParticipants(
      participants.map((p) =>
        p.id === id ? { ...p, [field]: field === "amount" ? parseFloat(value) || 0 : value } : p
      )
    );
  };

  const replicateSupplier = () => {
    if (supplier) {
      setParticipants(
        participants.map((p) => ({ ...p, name: p.name || supplier }))
      );
      toast({
        title: "Fornecedor replicado!",
        description: "O nome do fornecedor foi aplicado a todos os participantes vazios.",
      });
    }
  };

  const calculateTotal = () => {
    return participants.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const handleSave = () => {
    if (!supplier || !budgetNumber) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha fornecedor e número da verba.",
        variant: "destructive",
      });
      return;
    }

    const validParticipants = participants.filter(p => p.name && p.email);
    
    if (validParticipants.length === 0) {
      toast({
        title: "Participantes necessários",
        description: "Adicione pelo menos um participante com nome e email.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      supplier,
      budgetNumber,
      participants: validParticipants,
      total: calculateTotal(),
    });

    // Reset form
    setSupplier("");
    setBudgetNumber("");
    setParticipants([{ id: "1", name: "", role: "", email: "", amount: 0 }]);
    onOpenChange(false);

    toast({
      title: "Premiação criada!",
      description: "A nova campanha foi adicionada com sucesso.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Nova Premiação</DialogTitle>
          <DialogDescription>
            Preencha os dados da campanha e adicione os participantes premiados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor *</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetNumber">Nº da Verba *</Label>
              <Input
                id="budgetNumber"
                value={budgetNumber}
                onChange={(e) => setBudgetNumber(e.target.value)}
                placeholder="000000"
              />
            </div>
          </div>

          {/* Participants Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Participantes</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={replicateSupplier}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Replicar fornecedor
                </Button>
                <Button
                  type="button"
                  onClick={addParticipant}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Cargo</TableHead>
                    <TableHead className="font-semibold">E-mail</TableHead>
                    <TableHead className="font-semibold">Valor (R$)</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <Input
                          value={participant.name}
                          onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                          placeholder="Nome completo"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={participant.role}
                          onValueChange={(value) => updateParticipant(participant.id, "role", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="email"
                          value={participant.email}
                          onChange={(e) => updateParticipant(participant.id, "email", e.target.value)}
                          placeholder="email@exemplo.com"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={participant.amount || ""}
                          onChange={(e) => updateParticipant(participant.id, "amount", e.target.value)}
                          placeholder="0,00"
                          className="h-9"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                          disabled={participants.length === 1}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="rounded-lg bg-primary-light p-4 min-w-[300px]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total da Premiação:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Premiação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
