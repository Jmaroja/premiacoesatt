import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

export type FirestorePremiacao = {
  id: string;
  numero?: string;
  fornecedor?: string;
  verba?: string;
  gerente?: string;
  email_gerente?: string;
  status?: string;
  participantes?: Array<{ nome: string; cargo: string; valor: number | string }>;
  aprovacoes?: { gerente: boolean | null; diretoria: boolean | null; dp: boolean | null };
  inputDate?: string;
  total?: number;
  created_at?: unknown;
  updated_at?: unknown;
};

export function useCampaignById(id: string | null) {
  const [data, setData] = useState<FirestorePremiacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getDoc(doc(db, "premiacoes", id))
      .then((snap) => {
        if (snap.exists()) {
          setData({ id: snap.id, ...(snap.data() as Omit<FirestorePremiacao, "id">) });
        } else {
          setData(null);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}


