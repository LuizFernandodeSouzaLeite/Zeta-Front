"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
import { api, EditorElement, Page } from "../lib/api";
import styles from "./page.module.css";

type Kind = EditorElement["kind"];

const defaults: Record<Kind, Record<string, string>> = {
  text: { content: "Texto", color: "#111827" },
  rectangle: { fill: "#2563eb" },
  ellipse: { fill: "#f97316" },
  image: {
    src: "https://placehold.co/320x200/e5e7eb/374151?text=Imagem",
  },
};

const elementLabels: Record<Kind, string> = {
  text: "Texto",
  rectangle: "Retângulo",
  ellipse: "Elipse",
  image: "Imagem",
};

const fieldLabels = {
  x: "X",
  y: "Y",
  width: "Largura",
  height: "Altura",
};

function ElementIcon({ kind }: { kind: Kind }) {
  if (kind === "text") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14M12 5v14M8.5 19h7" />
      </svg>
    );
  }

  if (kind === "rectangle") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
      </svg>
    );
  }

  if (kind === "ellipse") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="8" ry="7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m5.5 17 4.5-4 3 2.5 2.5-2 3 3.5" />
    </svg>
  );
}

export default function Home() {
  const [page, setPage] = useState<Page | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState("Carregando projeto...");
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const selected = page?.elements.find((item) => item.id === selectedId);

  useEffect(() => {
    void (async () => {
      try {
      const savedId = localStorage.getItem("zeta-project-id");
      const project = savedId ? await api.getProject(Number(savedId)) : await api.createProject();
      localStorage.setItem("zeta-project-id", String(project.id));
      setPage(project.pages[0]); setStatus("Salvo");
      } catch { setStatus("Não foi possível conectar à API"); }
    })();
  }, []);
  function replace(element: EditorElement) { setPage((current) => current && { ...current, elements: current.elements.map((item) => item.id === element.id ? element : item) }); }
  async function add(kind: Kind) {
    if (!page) return;
    const element = await api.createElement({ page_id: page.id, kind, x: 80 + page.elements.length * 16, y: 80 + page.elements.length * 16, width: kind === "text" ? 220 : 180, height: kind === "text" ? 56 : 120, position: page.elements.length, properties: defaults[kind] });
    setPage({ ...page, elements: [...page.elements, element] }); setSelectedId(element.id); setStatus("Salvo");
  }
  async function save(element: EditorElement) { setStatus("Salvando..."); try { replace(await api.updateElement(element.id, element)); setStatus("Salvo"); } catch { setStatus("Erro ao salvar"); } }
  function dragStart(event: PointerEvent<HTMLDivElement>, element: EditorElement) { const rect = canvas.current!.getBoundingClientRect(); drag.current = { id: element.id, dx: event.clientX - rect.left - element.x, dy: event.clientY - rect.top - element.y }; event.currentTarget.setPointerCapture(event.pointerId); setSelectedId(element.id); }
  function dragMove(event: PointerEvent<HTMLDivElement>) { if (!drag.current || !page || !canvas.current) return; const rect = canvas.current.getBoundingClientRect(); const element = page.elements.find((item) => item.id === drag.current!.id)!; replace({ ...element, x: Math.round(event.clientX - rect.left - drag.current.dx), y: Math.round(event.clientY - rect.top - drag.current.dy) }); }
  function dragEnd() { if (!drag.current || !page) return; const element = page.elements.find((item) => item.id === drag.current!.id); drag.current = null; if (element) void save(element); }

  const statusClass = status === "Salvo"
    ? styles.statusSaved
    : status === "Salvando..."
      ? styles.statusSaving
      : status.includes("Erro") || status.includes("Não foi")
        ? styles.statusError
        : styles.statusLoading;

  return (
    <main className={styles.editor}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
          </div>
          <div>
            <strong>Zeta Design</strong>
            <small>Editor visual</small>
          </div>
        </div>

        <div className={styles.documentName}>
          <span>Página atual</span>
          <strong>{page?.name ?? "Carregando..."}</strong>
        </div>

        <div className={`${styles.status} ${statusClass}`} role="status">
          <span className={styles.statusDot} />
          {status}
        </div>

        <button
          type="button"
          className={styles.saveButton}
          onClick={() => selected && void save(selected)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h11l3 3v13H5z" />
            <path d="M8 4v6h8V5M8 20v-6h8v6" />
          </svg>
          Salvar
        </button>
      </header>

      <aside className={styles.toolbar}>
        <div className={styles.panelHeading}>
          <span>Inserir</span>
          <strong>Elementos</strong>
        </div>

        <div className={styles.toolList}>
          {(["text", "rectangle", "ellipse", "image"] as Kind[]).map((kind) => (
            <button key={kind} type="button" onClick={() => void add(kind)}>
              <span className={styles.toolIcon}>
                <ElementIcon kind={kind} />
              </span>
              <span className={styles.toolCopy}>
                <strong>{elementLabels[kind]}</strong>
                <small>Adicionar ao canvas</small>
              </span>
              <span className={styles.toolPlus} aria-hidden="true">+</span>
            </button>
          ))}
        </div>

        <div className={styles.toolbarHint}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
          <span>Clique em um elemento para adicioná-lo ao projeto.</span>
        </div>
      </aside>

      <section className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <div>
            <strong>Canvas</strong>
            <span>Área de trabalho</span>
          </div>
          <span className={styles.canvasSize}>1000 × 650 px</span>
        </div>

        <div className={styles.canvasViewport}>
          <div
            ref={canvas}
            className={styles.canvas}
            onPointerMove={dragMove}
            onPointerUp={dragEnd}
            onPointerLeave={dragEnd}
            onClick={() => setSelectedId(null)}
          >
            {page?.elements.map((item) => (
              <div
                key={item.id}
                onPointerDown={(event) => dragStart(event, item)}
                onClick={(event) => event.stopPropagation()}
                className={`${styles.element} ${selectedId === item.id ? styles.selected : ""} ${styles[item.kind]}`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  background: item.kind === "image" ? undefined : item.properties.fill,
                }}
              >
                {item.kind === "text" && (
                  <span style={{ color: item.properties.color }}>
                    {item.properties.content}
                  </span>
                )}
                {item.kind === "image" && (
                  <img src={item.properties.src} alt="Imagem" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className={styles.properties}>
        <div className={styles.panelHeading}>
          <span>Inspecionar</span>
          <strong>Propriedades</strong>
        </div>

        {!selected ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 3 11 8-5 1 3 6-2 1-3-6-4 4z" />
              </svg>
            </div>
            <strong>Nenhum elemento selecionado</strong>
            <p>Selecione um item no canvas para editar suas propriedades.</p>
          </div>
        ) : (
          <div className={styles.propertiesContent}>
            <div className={styles.selectionSummary}>
              <span className={styles.selectionIcon}>
                <ElementIcon kind={selected.kind} />
              </span>
              <div>
                <small>Selecionado</small>
                <strong>{elementLabels[selected.kind]}</strong>
              </div>
              <span className={styles.elementId}>#{selected.id}</span>
            </div>

            <div className={styles.propertySection}>
              <div className={styles.sectionTitle}>Posição e tamanho</div>
              <div className={styles.fieldGrid}>
                {(["x", "y", "width", "height"] as const).map((field) => (
                  <label key={field}>
                    <span>{fieldLabels[field]}</span>
                    <input
                      type="number"
                      value={selected[field]}
                      onChange={(event) => replace({ ...selected, [field]: Number(event.target.value) })}
                      onBlur={() => void save(selected)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {selected.kind === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionTitle}>Conteúdo</div>
                <label className={styles.fullField}>
                  <span>Texto</span>
                  <input
                    value={selected.properties.content}
                    onChange={(event) => replace({ ...selected, properties: { ...selected.properties, content: event.target.value } })}
                    onBlur={() => void save(selected)}
                  />
                </label>
              </div>
            )}

            {selected.kind !== "image" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionTitle}>Aparência</div>
                <label className={styles.colorField}>
                  <span>Cor</span>
                  <span className={styles.colorControl}>
                    <input
                      type="color"
                      value={selected.properties.fill || selected.properties.color}
                      onChange={(event) => { const key = selected.kind === "text" ? "color" : "fill"; replace({ ...selected, properties: { ...selected.properties, [key]: event.target.value } }); }}
                      onBlur={() => void save(selected)}
                    />
                    <span>{selected.properties.fill || selected.properties.color}</span>
                  </span>
                </label>
              </div>
            )}

            <button
              type="button"
              className={styles.removeButton}
              onClick={() => { if (!selected) return; void api.deleteElement(selected.id); setPage(page && { ...page, elements: page.elements.filter((item) => item.id !== selected.id) }); setSelectedId(null); }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
              </svg>
              Remover elemento
            </button>
          </div>
        )}
      </aside>
    </main>
  );
}
