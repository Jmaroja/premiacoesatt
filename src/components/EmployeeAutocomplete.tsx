import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Employee = { nome: string; matricula?: string; cargo?: string; nameLower?: string };

export default function EmployeeAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (e: Employee) => void;
  placeholder?: string;
}) {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectionLock = useRef(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const tries: string[] = [];
      try {
        tries.push('/employees.json');
        let res = await fetch('/employees.json', { cache: 'no-store' });
        if (!res.ok) {
          // try origin
          const origin = window.location.origin;
          tries.push(`${origin}/employees.json`);
          res = await fetch(`${origin}/employees.json`, { cache: 'no-store' });
        }
        if (!res.ok) {
          // try common dev ports using hostname
          const host = window.location.hostname || 'localhost';
          const ports = [5173, 8080, 8081, 3000];
          for (const p of ports) {
            const u = `http://${host}:${p}/employees.json`;
            tries.push(u);
            try {
              const r2 = await fetch(u, { cache: 'no-store' });
              if (r2.ok) { res = r2; break; }
            } catch (e) {
              // continue
            }
          }
        }
        if (!res || !res.ok) {
          console.warn('[EmployeeAutocomplete] failed to load employees.json; tried:', tries.join(', '));
          return;
        }
        const raw = await res.json();
        if (!mounted) return;
        // Normalize and defensively coerce the loaded data to Employee[]
        let list: Employee[] = [];
        if (Array.isArray(raw)) {
          const getValue = (obj: Record<string, unknown>, keys: string[]) => {
            for (const k of keys) {
              const v = obj[k];
              if (typeof v === 'string') return v;
              if (typeof v === 'number') return String(v);
            }
            return undefined;
          };

          list = (raw as unknown[])
            .map((d: unknown) => {
              const obj = (d as Record<string, unknown>) || {};
              const nome = getValue(obj, ['nome', 'Nome', 'name']) ?? '';
              const matricula = getValue(obj, ['matricula', 'Matricula']);
              const cargo = getValue(obj, ['cargo', 'função', 'funcao', 'Função', 'Cargo']) ?? '';
              const rawLower = getValue(obj, ['nameLower']);
              const nameLower = (typeof rawLower === 'string' && rawLower) ? rawLower.toLowerCase() : nome.toLowerCase();
              return { nome, matricula, cargo, nameLower } as Employee;
            })
            .filter((e: Employee) => !!e.nome);
        } else {
          console.warn('[EmployeeAutocomplete] employees.json did not contain an array; got:', typeof raw, raw);
        }
        console.debug('[EmployeeAutocomplete] loaded employees', list.length, list[0]);
        setEmployees(list);
      } catch (err) {
        console.warn('[EmployeeAutocomplete] error loading employees.json', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const suggestions = useMemo(() => {
    try {
      if (!employees || !query) return [];
      const q = query.trim().toLowerCase();
      if (q.length < 1) return [];
      const res = employees
        .filter((e) => {
          const nameLower = e?.nameLower ?? (typeof e?.nome === 'string' ? e.nome.toLowerCase() : '');
          const mat = e?.matricula ?? '';
          return (nameLower || '').includes(q) || mat.includes(q);
        })
        .slice(0, 8);
      console.debug('[EmployeeAutocomplete] suggestions for', q, res.slice(0,3));
      return res;
    } catch (err) {
      console.warn('[EmployeeAutocomplete] error filtering suggestions', err);
      return [];
    }
  }, [employees, query]);

  function pick(e: Employee) {
    // prevent typing from overwriting the selection for a short moment
    selectionLock.current = true;
    // Call onSelect first so parent state updates before we close the popup.
    console.debug('[EmployeeAutocomplete] pick', e);
    try { onSelect(e); } catch (err) { /* ignore */ }
    // Also call onChange with the full name so controlled inputs in parent get updated
    try { onChange(e.nome); } catch (err) { /* ignore */ }
    // then update local query and close
    setQuery(e.nome);
    setOpen(false);
    // release lock shortly after
    setTimeout(() => { selectionLock.current = false; }, 200);
  }

  useEffect(() => {
    if (!open || !inputRef.current) return;
    const el = inputRef.current;
    const r = el.getBoundingClientRect();
    setRect(r);
  }, [open, query]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={(ev) => {
          // ignore input changes while a selection lock is active to avoid overwriting
          if (selectionLock.current) {
            setQuery(ev.target.value);
            return;
          }
          setQuery(ev.target.value);
          onChange(ev.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full h-9 px-2 border rounded"
      />
      {open && suggestions.length > 0 && (
        // If rect is available we render in a portal positioned on the page;
        // otherwise render inline absolutely positioned inside the relative container
        rect ? createPortal(
          <ul
              style={{
                position: 'fixed',
                left: rect.left + window.scrollX,
                top: rect.bottom + window.scrollY + 4,
                width: rect.width,
                maxHeight: 200,
                overflow: 'auto',
                zIndex: 9999,
                background: 'white',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 6,
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                pointerEvents: 'auto'
              }}
              role="listbox"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.matricula || s.nome + i}
                  onPointerDown={(ev) => { ev.preventDefault(); ev.stopPropagation(); pick(s); }}
                  onClick={(ev) => { ev.stopPropagation(); }}
                  role="option"
                  tabIndex={0}
                  className="px-2 py-1 cursor-pointer hover:bg-slate-100 text-sm"
                >
                  <div className="font-medium">{s.nome}</div>
                  <div className="text-xs text-muted-foreground">{s.matricula ?? ''} {s.cargo ? `· ${s.cargo}` : ''}</div>
                </li>
              ))}
            </ul>,
          document.body
        ) : (
          <ul
            style={{
              position: 'absolute',
              left: 0,
              top: '100%',
              marginTop: 6,
              width: '100%',
              maxHeight: 200,
              overflow: 'auto',
              zIndex: 9999,
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 6,
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
              pointerEvents: 'auto'
            }}
            role="listbox"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.matricula || s.nome + i}
                onPointerDown={(ev) => { ev.preventDefault(); ev.stopPropagation(); pick(s); }}
                onClick={(ev) => { ev.stopPropagation(); }}
                role="option"
                tabIndex={0}
                className="px-2 py-1 cursor-pointer hover:bg-slate-100 text-sm"
              >
                <div className="font-medium">{s.nome}</div>
                <div className="text-xs text-muted-foreground">{s.matricula ?? ''} {s.cargo ? `· ${s.cargo}` : ''}</div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
