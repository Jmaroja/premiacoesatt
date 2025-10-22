import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";

export interface Gerente {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  varejo?: string;
}

export function useGerentes() {
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Traz todos e filtra no client para evitar filtros divergentes
    let mounted = true;
    const col = collection(db, "responsaveis");
    const unsub = onSnapshot(col, (snap) => {
      const list = snap.docs.map((doc) => {
        const raw = doc.data() as Record<string, unknown>;
        const nome = String((raw.nome ?? raw.nome_gerente ?? doc.id) || "");
  const email = String((raw.email ?? (raw as Record<string, unknown>)["e-mail"] ?? "") || "");
        const cargo = (raw.cargo as string | undefined);
        const varejo = (raw.varejo as string | undefined);
        return { id: doc.id, nome, email, cargo, varejo };
      });
      // Attempt to merge with overrides from public/gerentes-overrides.json
      (async () => {
        try {
          const resp = await fetch('/gerentes-overrides.json', { cache: 'no-store' });
          if (!resp.ok) {
            if (mounted) { setGerentes(list); setLoading(false); }
            return;
          }
          const overrides = await resp.json() as Array<{ id: string; nome: string; email: string }>;
          // create map by email to prioritize overrides
          const map = new Map<string, { id: string; nome: string; email: string }>();
          for (const o of overrides) map.set((o.email || '').toLowerCase().trim(), o);
          const merged = list.slice();
          // apply overrides: if email exists in overrides, replace or add
          for (const o of overrides) {
            const idx = merged.findIndex(g => (g.email || '').toLowerCase().trim() === (o.email || '').toLowerCase().trim());
            if (idx === -1) merged.push({ id: o.id, nome: o.nome, email: o.email, cargo: undefined, varejo: undefined });
            else merged[idx] = { ...merged[idx], nome: o.nome, email: o.email };
          }
          if (mounted) { setGerentes(merged); setLoading(false); }
        } catch (e) {
          if (mounted) { setGerentes(list); setLoading(false); }
        }
      })();
    });
    return () => { mounted = false; unsub(); };
  }, []);

  return { gerentes, loading };
}

