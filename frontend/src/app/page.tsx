"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
import { api, EditorElement, Page } from "../lib/api";
import styles from "./page.module.css";

type Kind = EditorElement["kind"];
const defaults: Record<Kind, Record<string, string>> = { text: { content: "Texto", color: "#111827" }, rectangle: { fill: "#2563eb" }, ellipse: { fill: "#f97316" }, image: { src: "https://placehold.co/320x200/e5e7eb/374151?text=Imagem" } };

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
  return <main className={styles.editor}><header><strong>Zeta Design</strong><span>{status}</span><button onClick={() => selected && void save(selected)}>Salvar</button></header><aside className={styles.toolbar}><b>Elementos</b>{(["text", "rectangle", "ellipse", "image"] as Kind[]).map((kind) => <button key={kind} onClick={() => void add(kind)}>+ {kind}</button>)}</aside><section className={styles.workspace}><div ref={canvas} className={styles.canvas} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerLeave={dragEnd} onClick={() => setSelectedId(null)}>{page?.elements.map((item) => <div key={item.id} onPointerDown={(event) => dragStart(event, item)} onClick={(event) => event.stopPropagation()} className={`${styles.element} ${selectedId === item.id ? styles.selected : ""} ${styles[item.kind]}`} style={{ left: item.x, top: item.y, width: item.width, height: item.height, background: item.kind === "image" ? undefined : item.properties.fill }}>{item.kind === "text" && <span style={{ color: item.properties.color }}>{item.properties.content}</span>}{item.kind === "image" && <img src={item.properties.src} alt="Imagem" />}</div>)}</div></section><aside className={styles.properties}><b>Propriedades</b>{!selected ? <p>Selecione um elemento</p> : <>{(["x", "y", "width", "height"] as const).map((field) => <label key={field}>{field}<input type="number" value={selected[field]} onChange={(event) => replace({ ...selected, [field]: Number(event.target.value) })} onBlur={() => void save(selected)} /></label>)}{selected.kind === "text" && <label>Texto<input value={selected.properties.content} onChange={(event) => replace({ ...selected, properties: { ...selected.properties, content: event.target.value } })} onBlur={() => void save(selected)} /></label>}{selected.kind !== "image" && <label>Cor<input type="color" value={selected.properties.fill || selected.properties.color} onChange={(event) => { const key = selected.kind === "text" ? "color" : "fill"; replace({ ...selected, properties: { ...selected.properties, [key]: event.target.value } }); }} onBlur={() => void save(selected)} /></label>}<button onClick={() => { if (!selected) return; void api.deleteElement(selected.id); setPage(page && { ...page, elements: page.elements.filter((item) => item.id !== selected.id) }); setSelectedId(null); }}>Remover</button></>}</aside></main>;
}
