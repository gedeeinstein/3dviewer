"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export type ModelInfo = { objects: number; triangles: number; dimensions: string };
type Props = { file: File | null; grid: boolean; wireframe: boolean; onInfo: (info: ModelInfo) => void; onError: (message: string) => void };

function sampleChair() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0xc88756, roughness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x353b38, roughness: 0.35, metalness: 0.65 });
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], rotation?: [number, number, number]) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); if (rotation) mesh.rotation.set(...rotation); group.add(mesh);
  };
  add(new THREE.BoxGeometry(2.5, .18, 2.2), wood, [0, 1.8, 0]);
  add(new THREE.BoxGeometry(2.5, 2.25, .16), wood, [0, 3.05, 1.02], [-.12, 0, 0]);
  for (const x of [-1.05, 1.05]) for (const z of [-.85, .85]) add(new THREE.CylinderGeometry(.09, .12, 2.15, 18), dark, [x, .72, z], [0, 0, x * .05]);
  group.rotation.y = -.55; return group;
}

export function DesignViewer({ file, grid, wireframe, onInfo, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe8e7e2);
    const camera = new THREE.PerspectiveCamera(38, 1, .01, 1000); camera.position.set(6.5, 5, 7.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1.7, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c706b, 2.3)); const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(4, 8, 5); scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .08 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.38; scene.add(floor);
    const helper = new THREE.GridHelper(30, 30, 0xb9b9b3, 0xd3d2cd); helper.position.y = -.37; helper.visible = grid; scene.add(helper);
    let model: THREE.Object3D = sampleChair(); scene.add(model);
    let frame = 0;
    const fit = (object: THREE.Object3D) => { const box = new THREE.Box3().setFromObject(object); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3()); const max = Math.max(size.x, size.y, size.z, .001); object.position.sub(center); object.scale.setScalar(4 / max); controls.target.set(0, 0, 0); camera.position.set(5.5, 4, 6.5); controls.update(); let objects = 0, triangles = 0; object.traverse((node) => { if (node instanceof THREE.Mesh) { objects++; const g = node.geometry; triangles += g.index ? g.index.count / 3 : (g.attributes.position?.count ?? 0) / 3; } }); onInfo({ objects, triangles: Math.round(triangles), dimensions: `${Math.round(size.x * 100)} × ${Math.round(size.y * 100)} × ${Math.round(size.z * 100)} mm` }); };
    const applyWireframe = () => model.traverse((node) => { if (node instanceof THREE.Mesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => { if ("wireframe" in m) (m as THREE.MeshStandardMaterial).wireframe = wireframe; }); });
    if (file) { const url = URL.createObjectURL(file); const ext = file.name.split(".").pop()?.toLowerCase(); const done = (object: THREE.Object3D) => { scene.remove(model); model = object; scene.add(model); fit(model); applyWireframe(); URL.revokeObjectURL(url); }; const fail = () => { onError(`We couldn’t read ${file.name}. Check that the file is valid and try again.`); URL.revokeObjectURL(url); };
      if (ext === "stl") new STLLoader().load(url, (g) => done(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xd9915f, roughness: .55 }))), undefined, fail);
      else if (ext === "obj") new OBJLoader().load(url, done, undefined, fail);
      else if (ext === "glb" || ext === "gltf") new GLTFLoader().load(url, (g) => done(g.scene), undefined, fail);
      else if (ext === "3dm") { const loader = new Rhino3dmLoader(); loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.17.0/"); loader.load(url, done, undefined, fail); }
    }
    applyWireframe();
    const resize = () => { const { clientWidth: w, clientHeight: h } = el; renderer.setSize(w, h, false); camera.aspect = w / Math.max(h, 1); camera.updateProjectionMatrix(); }; const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const tick = () => { controls.update(); renderer.render(scene, camera); frame = requestAnimationFrame(tick); }; tick();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); renderer.dispose(); renderer.domElement.remove(); URL.revokeObjectURL(renderer.domElement.dataset.url ?? ""); };
  }, [file, grid, wireframe, onInfo, onError]);
  return <div className="design-canvas" ref={host} aria-label="Interactive 3D design viewport" />;
}
