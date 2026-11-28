"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function WhiteMesh3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

    // --- Lighting (Gentle warm studio setup to highlight 3D curves) ---
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

    // --- Load GLB Model ---
    const loader = new GLTFLoader();
    loader.load(
      "/models/white_mesh.glb",
      (gltf) => {
        const root = gltf.scene;

        // Apply a clean porcelain/chalk white material if model has no materials
        const whiteMaterial = new THREE.MeshStandardMaterial({
          color: 0xfaf6ee,
          roughness: 0.38,
          metalness: 0.05,
        });

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (!mesh.material || Array.isArray(mesh.material) && mesh.material.length === 0) {
              mesh.material = whiteMaterial;
            }
          }
        });

        // Compute bounding box and normalize
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const targetScale = 1.3 / maxDim;
        root.scale.set(targetScale, targetScale, targetScale);
        root.position.x = -center.x * targetScale;
        root.position.y = -center.y * targetScale;
        root.position.z = -center.z * targetScale;

        meshGroup = new THREE.Group();
        meshGroup.add(root);
        scene.add(meshGroup);

        setIsLoaded(true);
      },
      undefined,
      (err) => console.warn("Failed to load /models/white_mesh.glb:", err)
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
        // High-energy horizontal 360-degree spin (~ 7.5 rad/s)
        meshGroup.rotation.y += delta * 7.5 * spinMultiplier;

        // Iconic meme rhythmic vertical bounce
        meshGroup.position.y = Math.sin(time * 0.012) * 0.08;

        // Slight squash and stretch cadence
        const squish = 1 + Math.sin(time * 0.024) * 0.04;
        meshGroup.scale.set(1, squish, 1);

        // Gradually decay extra spin multiplier from click
        if (spinMultiplier > 1.0) {
          spinMultiplier = Math.max(1.0, spinMultiplier - delta * 1.5);
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // Interactive click: spins super fast and yells O-I-A-O-I-A-A
    const handleClick = () => {
      spinMultiplier = 2.8;
      setSpeech("🎶 O-I-A-O-I-A-A! 🎶");
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setSpeech(null), 2500);
    };

    container.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animFrameId);
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
      {/* 3D Canvas Box */}
      <div
        ref={containerRef}
        className="w-24 h-24 sm:w-28 sm:h-28 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        title="O-I-A-O-I-A-A! Click me to spin faster!"
      />

      {/* Meme Speech Bubble */}
      {speech && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-mono font-black text-bark-950 border-2 border-white shadow-xl animate-bounce pointer-events-none z-50">
          {speech}
        </div>
      )}

      {/* Mini loading fallback */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-amber-200/50">
          Loading 3D...
        </div>
      )}
    </div>
  );
}
