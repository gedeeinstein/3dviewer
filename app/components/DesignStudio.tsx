"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  Box, BoxSelect, ChevronDown, Download, Eye, FileBox, FolderOpen,
  Grid3X3, Info, Layers3, Maximize, MousePointer2, Move3D, Rotate3D,
  Ruler, Settings2, Share2, Sparkles, Upload, X, ZoomIn,
} from "lucide-react";
import { DesignViewer, type ModelInfo } from "./DesignViewer";
import "./design-studio.css";

const FORMATS = ["3DM", "STL", "OBJ", "GLB", "GLTF"];

export function DesignStudio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<ModelInfo>({ objects: 5, triangles: 7424, dimensions: "240 × 92 × 168 mm" });
  const [wireframe, setWireframe] = useState(false);
  const [grid, setGrid] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const choose = useCallback((candidate?: File) => {
    if (!candidate) return;
    const ext = candidate.name.split(".").pop()?.toLowerCase();
    if (!ext || !["3dm", "stl", "obj", "glb", "gltf"].includes(ext)) {
      setNotice("That file type isn’t supported yet. Try 3DM, STL, OBJ, GLB, or GLTF.");
      return;
    }
    setNotice(null);
    setFile(candidate);
  }, []);

  return (
    <main className="design-app">
      <header className="design-header">
        <Link className="design-brand" href="/en" aria-label="Formspace home"><span><BoxSelect size={23} /></span><strong>formspace</strong></Link>
        <nav aria-label="Main navigation"><button className="active">Viewer</button><button>Projects</button><button>Learn</button></nav>
        <div className="header-actions"><button className="plain-button"><Share2 size={16} /> Share</button><button className="export-button"><Download size={16} /> Export <ChevronDown size={14} /></button><button className="avatar">AK</button></div>
      </header>

      <section className="design-workspace">
        <aside className="project-panel">
          <div className="panel-title"><span>PROJECT</span><button aria-label="Project settings"><Settings2 size={16} /></button></div>
          <div className="file-card">
            <div className="file-icon"><FileBox size={24} /></div>
            <div><strong>{file?.name ?? "chair-study.3dm"}</strong><small>{file ? `${(file.size / 1_048_576).toFixed(1)} MB` : "12.8 MB"} · {file?.name.split(".").pop()?.toUpperCase() ?? "Rhino 3D"}</small></div>
            <button onClick={() => setFile(null)} aria-label="Close file"><X size={15} /></button>
          </div>

          <button className="upload-card" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files[0]); }}>
            <Upload size={22} /><strong>Open a design file</strong><span>Drop a file here or browse</span><small>{FORMATS.join("  ·  ")} · up to 100 MB</small>
          </button>
          <input ref={inputRef} hidden type="file" accept=".3dm,.stl,.obj,.glb,.gltf" onChange={(e) => choose(e.target.files?.[0])} />
          {notice && <p className="file-notice" role="alert">{notice}</p>}

          <div className="section-heading"><span>SCENE</span><button><Eye size={15} /></button></div>
          <div className="scene-tree">
            <button className="tree-root"><ChevronDown size={14} /><Layers3 size={16} /><b>{file?.name.replace(/\.[^.]+$/, "") ?? "Chair study"}</b><Eye size={14} /></button>
            {["Frame", "Seat shell", "Backrest", "Hardware"].map((name, index) => <button key={name} className={index === 1 ? "selected" : ""}><span className="tree-line" /><Box size={14} /><span>{name}</span><Eye size={13} /></button>)}
          </div>
          <div className="supported"><Info size={15} /><p><strong>Built for design files</strong><br />Rhino layers, STL meshes, and glTF materials are preserved whenever the format allows.</p></div>
        </aside>

        <section className="viewport-panel">
          <DesignViewer file={file} grid={grid} wireframe={wireframe} onInfo={setInfo} onError={setNotice} />
          <div className="view-title"><span className="live-dot" /> {file?.name ?? "chair-study.3dm"}<small>Perspective</small></div>
          <div className="view-cube"><b>TOP</b><span>FRONT</span><i>RIGHT</i></div>
          <div className="view-toolbar">
            <button title="Select"><MousePointer2 size={18} /></button><button title="Orbit"><Rotate3D size={18} /></button><button title="Pan"><Move3D size={18} /></button><button title="Zoom"><ZoomIn size={18} /></button><hr />
            <button className={grid ? "active" : ""} title="Grid" onClick={() => setGrid(!grid)}><Grid3X3 size={18} /></button>
            <button className={wireframe ? "active" : ""} title="Wireframe" onClick={() => setWireframe(!wireframe)}><BoxSelect size={18} /></button><button title="Fit view"><Maximize size={18} /></button>
          </div>
          <div className="view-hint"><Sparkles size={14} /> Drag to orbit · Scroll to zoom · Right-drag to pan</div>
        </section>

        <aside className="details-panel">
          <div className="details-head"><div><span>MODEL OVERVIEW</span><h1>{file?.name.replace(/\.[^.]+$/, "") ?? "Chair study"}</h1></div><button><FolderOpen size={17} /></button></div>
          <p className="details-copy">Inspect your model, review geometry, and share a clean interactive view without opening the original design software.</p>
          <div className="stat-grid"><article><Box size={17} /><span>Objects<strong>{info.objects.toLocaleString()}</strong></span></article><article><Layers3 size={17} /><span>Triangles<strong>{info.triangles.toLocaleString()}</strong></span></article><article className="wide"><Ruler size={17} /><span>Model size<strong>{info.dimensions}</strong></span></article></div>
          <div className="property-section"><span>APPEARANCE</span><label>Display <button onClick={() => setWireframe(!wireframe)}>{wireframe ? "Wireframe" : "Shaded"}<ChevronDown size={14} /></button></label><label>Edges <button>Soft edges<ChevronDown size={14} /></button></label><label>Background <i className="color-dot" /> <button>Warm gray<ChevronDown size={14} /></button></label></div>
          <div className="property-section"><span>FILE DETAILS</span><dl><div><dt>Format</dt><dd>{file?.name.split(".").pop()?.toUpperCase() ?? "3DM (Rhino)"}</dd></div><div><dt>Uploaded</dt><dd>Just now</dd></div><div><dt>Units</dt><dd>Millimeters</dd></div><div><dt>Mesh quality</dt><dd className="quality"><i /> Ready</dd></div></dl></div>
          <div className="share-callout"><div><Share2 size={18} /><strong>Ready to review?</strong></div><p>Share an interactive link. Reviewers don’t need an account or CAD software.</p><button>Copy review link</button></div>
        </aside>
      </section>
    </main>
  );
}
