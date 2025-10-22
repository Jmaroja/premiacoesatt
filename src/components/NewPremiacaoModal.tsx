import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface Gerente {
  id: string;
  nome_gerente: string;
  email: string;
}

export default function NovaPremiacaoModal({ onClose }: { onClose: () => void }) {
  const [fornecedor, setFornecedor] = useState("");
  const [verba, setVerba] = useState("");
  const [participantes, setParticipantes] = useState([{ nome: "", cargo: "", email: "", valor: "" }]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [gerenteSelecionado, setGerenteSelecionado] = useState<string>("");

  // 🔹 Carrega os gerentes do Firestore
  useEffect(() => {
    const carregarGerentes = async () => {
      const snap = await getDocs(collection(db, "responsaveis"));
      const lista: Gerente[] = snap.docs.map((doc) => ({
        id: doc.id,
        nome_gerente: doc.data()["nome_gerente"],
        email: doc.data()["e-mail"],
      }));
      setGerentes(lista);
    };
    carregarGerentes();
  }, []);

  // 🔹 Adiciona nova premiação
  const salvarPremiacao = async () => {
    if (!fornecedor || !verba || !gerenteSelecionado) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const gerenteData = gerentes.find((g) => g.nome_gerente === gerenteSelecionado);

    const novaPremiacao = {
      fornecedor,
      verba,
      participantes,
      gerente: gerenteSelecionado,
      email_gerente: gerenteData?.email || "",
      status: "Em andamento",
      criado_em: serverTimestamp(),
      aprovacoes: {
        gerente: { aprovado: false },
        diretoria: { aprovado: false },
        dp: { aprovado: false },
      },
    };

    await addDoc(collection(db, "premiacoes"), novaPremiacao);
    alert(`Premiação criada e vinculada ao gerente ${gerenteSelecionado}`);
    onClose();
  };

  const adicionarParticipante = () => {
    setParticipantes([...participantes, { nome: "", cargo: "", email: "", valor: "" }]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[800px] p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Nova Premiação</h2>

        {/* Fornecedor e Verba */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Fornecedor *</label>
            <input
              className="w-full border p-2 rounded"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nº da Verba *</label>
            <input
              className="w-[150px] border p-2 rounded"
              value={verba}
              onChange={(e) => setVerba(e.target.value)}
              placeholder="000000"
            />
          </div>
        </div>

        {/* Seleção de Gerente */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Gerente Responsável *</label>
          <select
            className="w-full border p-2 rounded"
            value={gerenteSelecionado}
            onChange={(e) => setGerenteSelecionado(e.target.value)}
          >
            <option value="">Selecione um gerente...</option>
            {gerentes.map((g) => (
              <option key={g.id} value={g.nome_gerente}>
                {g.nome_gerente}
              </option>
            ))}
          </select>
        </div>

        {/* Participantes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Participantes</label>
          {participantes.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Nome completo"
                value={p.nome}
                onChange={(e) => {
                  const novaLista = [...participantes];
                  novaLista[i].nome = e.target.value;
                  setParticipantes(novaLista);
                }}
              />
              <input
                className="w-[100px] border p-2 rounded"
                placeholder="Cargo"
                value={p.cargo}
                onChange={(e) => {
                  const novaLista = [...participantes];
                  novaLista[i].cargo = e.target.value;
                  setParticipantes(novaLista);
                }}
              />
              <input
                className="w-[100px] border p-2 rounded"
                placeholder="Valor (R$)"
                value={p.valor}
                onChange={(e) => {
                  const novaLista = [...participantes];
                  novaLista[i].valor = e.target.value;
                  setParticipantes(novaLista);
                }}
              />
            </div>
          ))}
          <button
            onClick={adicionarParticipante}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            + Adicionar Participante
          </button>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={salvarPremiacao}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar Premiação
          </button>
        </div>
      </div>
    </div>
  );
}
