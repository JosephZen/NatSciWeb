"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Stylized procedural 3D spinning cat fallback in case of network stall or LFS pointer
function createProceduralCat(): THREE.Group {
  const group = new THREE.Group();
  const catMat = new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.35, metalness: 0.05 });
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const body = new THREE.Mesh(bodyGeo, catMat);
  body.scale.set(0.9, 1.1, 0.9);
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const head = new THREE.Mesh(headGeo, catMat);
  head.position.set(0, 0.38, 0.05);
  group.add(head);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.1, 0.18, 4);
  const ear1 = new THREE.Mesh(earGeo, catMat);
  ear1.rotation.set(-0.2, 0, -0.3);
  ear1.position.set(-0.16, 0.62, 0.05);
  const ear2 = new THREE.Mesh(earGeo, catMat);
  ear2.rotation.set(-0.2, 0, 0.3);
  ear2.position.set(0.16, 0.62, 0.05);
  group.add(ear1);
  group.add(ear2);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
  const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
  eye1.position.set(-0.1, 0.42, 0.3);
  const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
  eye2.position.set(0.1, 0.42, 0.3);
  group.add(eye1);
  group.add(eye2);

  // Nose
  const noseGeo = new THREE.ConeGeometry(0.025, 0.03, 3);
  const nose = new THREE.Mesh(noseGeo, pinkMat);
  nose.rotation.set(Math.PI / 2, 0, 0);
  nose.position.set(0, 0.35, 0.32);
  group.add(nose);

  group.scale.set(1.2, 1.2, 1.2);
  return group;
}

export default function WhiteMesh3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 100;
    const height = container.clientHeight || 100;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd97736, 1.2);
    rimLight.position.set(-2, -1, -2);
    scene.add(rimLight);

    let meshGroup: THREE.Group | null = null;
    let animFrameId: number;
    let spinMultiplier = 1.0;

    const attachMesh = (group: THREE.Group) => {
      meshGroup = group;
      scene.add(meshGroup);
      setIsLoaded(true);
      setProgress(null);
    };

    // --- Load GLB Model with progress & fallback ---
    const loader = new GLTFLoader();

    // 12-second safety timeout
    const timeoutId = setTimeout(() => {
      if (!meshGroup) {
        console.info("Using lightweight 3D cat fallback for immediate responsiveness.");
        attachMesh(createProceduralCat());
      }
    }, 12000);

    loader.load(
      "/models/white_mesh.glb",
      (gltf) => {
        clearTimeout(timeoutId);
        if (meshGroup) return;

        const root = gltf.scene;
        const whiteMaterial = new THREE.MeshStandardMaterial({
          color: 0xfaf6ee,
          roughness: 0.38,
          metalness: 0.05,
        });

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0)) {
              mesh.material = whiteMaterial;
            }
          }
        });

        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const targetScale = 1.3 / maxDim;
        root.scale.set(targetScale, targetScale, targetScale);
        root.position.x = -center.x * targetScale;
        root.position.y = -center.y * targetScale;
        root.position.z = -center.z * targetScale;

        const newGroup = new THREE.Group();
        newGroup.add(root);
        attachMesh(newGroup);
      },
      (xhr) => {
        if (xhr.total && xhr.total > 0) {
          const pct = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
          setProgress(pct);
        }
      },
      (err) => {
        console.warn("Could not load /models/white_mesh.glb; activating 3D fallback:", err);
        clearTimeout(timeoutId);
        if (!meshGroup) {
          attachMesh(createProceduralCat());
        }
      }
    );

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    // --- Animation Loop: The Meme Cat O-I-A-O-I-A-A Spin ---
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (meshGroup) {
        meshGroup.rotation.y += delta * 7.5 * spinMultiplier;
        meshGroup.position.y = Math.sin(time * 0.012) * 0.08;
        const squish = 1 + Math.sin(time * 0.024) * 0.04;
        meshGroup.scale.set(1, squish, 1);

        if (spinMultiplier > 1.0) {
          spinMultiplier = Math.max(1.0, spinMultiplier - delta * 1.5);
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    const handleClick = () => {
      spinMultiplier = 2.8;
      setSpeech("🎶 O-I-A-O-I-A-A! 🎶");
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setSpeech(null), 2500);
    };

    container.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      container.removeEventListener("click", handleClick);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative select-none pointer-events-auto">
      <div
        ref={containerRef}
        className="w-24 h-24 sm:w-28 sm:h-28 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        title="O-I-A-O-I-A-A! Click me to spin faster!"
      />

      {speech && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-mono font-black text-bark-950 border-2 border-white shadow-xl animate-bounce pointer-events-none z-50">
          {speech}
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-amber-200/70 bg-bark-950/40 rounded-xl backdrop-blur-sm">
          <span>{progress !== null ? `${progress}%` : "Loading..."}</span>
        </div>
      )}
    </div>
  );
}
