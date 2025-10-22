import React, { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { doc, updateDoc, runTransaction } from "firebase/firestore";
import { db } from "@/services/firebase";
import { auth } from "@/services/firebase";

interface Participante {
  nome: string;
  cargo: string;
  valor: string | number;
}

interface Aprovacoes {
  gerente: boolean | null;
  diretoria: boolean | null;
  dp: boolean | null;
}

interface Premiacao {
  id: string;
  numero: string;
  fornecedor: string;
  verba: string;
  gerente: string;
  email_gerente: string;
  status: string;
  participantes: Participante[];
  aprovacoes: Aprovacoes;
  inputDate?: string;
}

interface PremiacaoDetalhesModalProps {
  premiacao: Premiacao | null;
  onClose: () => void;
}


export default function PremiacaoDetalhesModal({ premiacao, onClose }: PremiacaoDetalhesModalProps) {
  const [loading, setLoading] = useState(false);
  const [papel, setPapel] = useState<"gerente" | "diretoria" | "dp" | null>(null);
  const [approvers, setApprovers] = useState<{ diretoria?: string; dp?: string } | null>(null);
  useEffect(() => {
    if (!premiacao) return;
    // Busca approvers.json se existir
    fetch("/approvers.json", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((cfg) => {
        setApprovers({
          diretoria: cfg?.diretoria?.email || "filipe@nordil.com.br",
          dp: cfg?.dp?.email || "gabriel@nordil.com.br"
        });
      })
      .catch(() => setApprovers({ diretoria: "filipe@nordil.com.br", dp: "gabriel@nordil.com.br" }));
  }, [premiacao]);

  useEffect(() => {
    if (!premiacao) return;
    const userEmail = (auth.currentUser?.email || "").toLowerCase().trim();
    const gerenteEmail = (premiacao.email_gerente || premiacao.gerente || "").toLowerCase().trim();
  const diretoriaEmail = (approvers?.diretoria || "filipe@nordil.com.br").toLowerCase().trim();
    const dpEmail = (approvers?.dp || "gabriel@nordil.com.br").toLowerCase().trim();
    if (userEmail && gerenteEmail && userEmail === gerenteEmail) {
      setPapel("gerente");
      return;
    }
    if (userEmail && diretoriaEmail && userEmail === diretoriaEmail) {
      setPapel("diretoria");
      return;
    }
    if (userEmail && dpEmail && userEmail === dpEmail) {
      setPapel("dp");
      return;
    }
    setPapel(null);
  }, [premiacao, approvers]);
  if (!premiacao) return null;

  const handleAprovar = async (valor: boolean) => {
    if (!papel) return alert("Você não tem permissão para aprovar esta etapa.");
    setLoading(true);
    try {
      const ref = doc(db, "premiacoes", premiacao.id);
      // Use transaction to avoid race conditions when multiple approvers act simultaneously
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Premiação não encontrada");
  const data = snap.data() as Record<string, unknown>;
  const current = (data.aprovacoes as Record<string, unknown>) || {};
        current[papel] = valor;
        const allApproved = current.gerente === true && current.diretoria === true && current.dp === true;
        await tx.update(ref, { aprovacoes: current, ...(allApproved ? { status: "aprovado" } : {}) });
      });
      alert(valor ? "Aprovado!" : "Não aprovado!");
      onClose();
    } catch (err) {
      alert("Erro ao atualizar aprovação: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const total = premiacao.participantes?.reduce(
    (sum: number, p: Participante) => sum + parseFloat(p.valor as string),
    0
  );

  function formatDateVal(val: unknown): string {
    try {
      if (!val) return "";
      // Firestore Timestamp? check for toDate function safely
      const possible = val as { toDate?: () => Date } | Date | string;
      if (possible && typeof (possible as { toDate?: unknown }).toDate === "function") {
        const d = (possible as { toDate: () => Date }).toDate();
        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
      }
      if (possible instanceof Date) {
        return possible.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
      }
      if (typeof possible === "string") return possible;
      return String(possible);
    } catch {
      return "";
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
  className={`w-[800px] p-6 rounded-2xl shadow-xl ${String(premiacao.status || "").toLowerCase() === "aprovado" ? "bg-blue-50" : "bg-white"}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Logo className="h-8 w-auto object-contain" ariaLabel="Nordil" />
          <h2 className="text-2xl font-semibold text-gray-800">
            {premiacao.numero || "Premiação"}
          </h2>
        </div>

        {/* Dados gerais */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Fornecedor</p>
            <p className="font-medium">{premiacao.fornecedor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nº da Verba</p>
            <p className="font-medium">{premiacao.verba}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gerente Responsável</p>
            <p className="font-medium">{premiacao.gerente || premiacao.email_gerente}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      String(premiacao.status || "").toLowerCase() === "aprovado"
                        ? "bg-green-100 text-green-700"
                        : String(premiacao.status || "").toLowerCase() === "em andamento"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {premiacao.status}
                  </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data da Solicitação</p>
            <p className="font-medium">{formatDateVal(premiacao.inputDate ?? (premiacao as unknown as Record<string, unknown>).created_at) || '-'}</p>
          </div>
        </div>

        {/* Participantes */}
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Participantes</p>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="p-2 border">Nome</th>
                <th className="p-2 border">Cargo</th>
                <th className="p-2 border">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {premiacao.participantes?.map((p, i) => (
                <tr key={i} className="text-center">
                  <td className="border p-2">{p.nome}</td>
                  <td className="border p-2">{p.cargo}</td>
                  <td className="border p-2">
                    {parseFloat(p.valor as string).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right mt-3 font-semibold text-blue-700">
            Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>

        {/* Aprovações */}
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Autorizações</p>
          <div className="flex gap-6">
            {(["gerente", "diretoria", "dp"] as const).map((key) => {
              const value = premiacao.aprovacoes?.[key] ?? null;
              // Fluxo: gerente -> diretoria -> dp
              let etapaAtual = false;
              if (key === "gerente") etapaAtual = premiacao.aprovacoes?.gerente === null || premiacao.aprovacoes?.gerente === undefined;
              if (key === "diretoria") etapaAtual = premiacao.aprovacoes?.gerente === true && (premiacao.aprovacoes?.diretoria === null || premiacao.aprovacoes?.diretoria === undefined);
              if (key === "dp") etapaAtual = premiacao.aprovacoes?.gerente === true && premiacao.aprovacoes?.diretoria === true && (premiacao.aprovacoes?.dp === null || premiacao.aprovacoes?.dp === undefined);
              return (
                <div key={key} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      value === true ? "bg-green-700 border-green-700" : value === false ? "bg-red-500 border-red-500" : "border-gray-400"
                    }`}
                  ></div>
                  <p className="text-sm capitalize">{key}</p>
                  {papel === key && etapaAtual && (
                    <div className="flex gap-1 mt-1">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs disabled:opacity-50"
                        disabled={loading || value === true}
                        onClick={() => handleAprovar(true)}
                      >Aprovar</button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs disabled:opacity-50"
                        disabled={loading || value === false}
                        onClick={() => handleAprovar(false)}
                      >Não aprovar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
