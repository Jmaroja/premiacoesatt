import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export function ChangePasswordModal() {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      await updatePassword(auth.currentUser, newPassword);
      toast({ title: "Senha alterada com sucesso" });
      setOpen(false);
      setNewPassword("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Erro ao alterar senha", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Alterar Senha</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Alterando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
