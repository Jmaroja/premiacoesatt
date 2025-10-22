declare global {
  interface Window {
    currentUserRole?: string;
    currentUserEmail?: string;
    currentUserVarejo?: string;
  }
}
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/services/firebase";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      // Busca dados do usuário no Firestore
      const snap = await getDocs(collection(db, "responsaveis"));
      let userData = null;
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.email === user.email || d["e-mail"] === user.email) {
          userData = d;
        }
      });
      window.currentUserRole = userData?.cargo || "";
      window.currentUserEmail = user.email;
      window.currentUserVarejo = userData?.varejo || "";
      toast({ title: "Login realizado" });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Erro ao entrar", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="w-full px-4 py-4 flex items-center">
        <Logo className="h-9 w-auto object-contain" ariaLabel="Nordil" />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center gap-2">
          <Logo className="h-10 w-auto object-contain" ariaLabel="Nordil" />
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm">E-mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm">Senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

