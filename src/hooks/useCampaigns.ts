import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { Campaign } from "@/components/CampaignTable";

type NewCampaign = {
  numero?: string;
  fornecedor: string;
  supplier?: string;
  verba: string;
  budgetNumber?: string;
  participantes: Array<{ nome: string; cargo: string; valor: number; email?: string | null }>;
  ganhadores?: number;
  total: number;
  status?: "em_andamento" | "aprovado" | "pago" | "encerrado";
  aprovacoes?: { gerente: boolean | null; diretoria: boolean | null; dp: boolean | null };
  gerente?: string | null;
  gerenteEmail?: string | null;
  email_gerente?: string | null;
  inputDate?: string;
};

function formatDate(val: unknown): string {
  try {
    if (!val) return "";
    // Firestore Timestamp
    if (val instanceof Timestamp) {
      const d = val.toDate();
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    // Date
    if (val instanceof Date) {
      return val.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    // String já formatada
    if (typeof val === "string") return val;
    return "";
  } catch {
    return "";
  }
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "premiacoes"), (snapshot) => {
      const data = snapshot.docs.map((d) => {
        const raw: DocumentData = d.data();
        const approvals = (raw.aprovacoes ?? raw.approvals ?? {}) as { gerente?: boolean | null; diretoria?: boolean | null; dp?: boolean | null };
        const participants = (raw.participantes ?? []) as Array<{ nome?: string; cargo?: string; valor?: number }>;
        const mapped: Campaign = {
          id: d.id,
          trackingNumber: (raw.numero ?? raw.trackingNumber ?? "") as string,
          supplier: (raw.fornecedor ?? raw.supplier ?? "") as string,
          verba: (raw.verba ?? raw.budgetNumber ?? "") as string,
          winnersCount: (raw.ganhadores ?? raw.winnersCount ?? participants.length) as number,
          total: Number(raw.total ?? 0),
          status: (raw.status ?? "em_andamento") as Campaign["status"],
          approvals: {
            gerente: approvals.gerente ?? null,
            diretoria: approvals.diretoria ?? null,
            dp: approvals.dp ?? null,
          },
          gerente: (raw.gerente ?? raw.gerenteEmail ?? raw.email_gerente ?? "") as string,
          email_gerente: (raw.email_gerente ?? raw.gerenteEmail ?? raw.gerente ?? "") as string,
          inputDate: formatDate(raw.inputDate ?? raw.created_at ?? raw.data_input),
        };
        return mapped;
      });
      setCampaigns(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const addCampaign = async (newCampaign: NewCampaign) => {
    try {
      console.log('[useCampaigns] addCampaign payload:', newCampaign);
      await addDoc(collection(db, "premiacoes"), {
        ...newCampaign,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao adicionar premiação:", error);
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await deleteDoc(doc(db, "premiacoes", id));
    } catch (error) {
      console.error("Erro ao excluir premiação:", error);
      throw error;
    }
  };

  const updateCampaign = async (id: string, data: Record<string, unknown>) => {
    try {
      console.log('[useCampaigns] updateCampaign id:', id, 'payload:', data);
      await updateDoc(doc(db, "premiacoes", id), { ...data, updated_at: serverTimestamp() });
    } catch (error) {
      console.error("Erro ao atualizar premiação:", error);
      throw error;
    }
  };

  return { campaigns, addCampaign, deleteCampaign, updateCampaign, loading };
}
