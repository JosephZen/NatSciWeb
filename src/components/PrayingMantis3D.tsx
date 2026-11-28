"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const SPEECH_MESSAGES = [
  "🦗 Mantis on patrol!",
  "🌿 Looking for juicy aphids...",
  "👀 Did you see that spider?",
  "✨ Just blending into the leaves...",
  "🔍 Inspecting campus catalog...",
];

// Stylized procedural 3D mantis fallback in case of network stall or LFS pointer
function createProceduralMantis(): THREE.Group {
  const group = new THREE.Group();
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.4 });
  const darkGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });

  // Thorax
  const thoraxGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8);
  const thorax = new THREE.Mesh(thoraxGeo, greenMat);
  thorax.rotation.z = Math.PI / 4;
  thorax.position.set(0, 0.12, 0);
  group.add(thorax);

  // Abdomen
  const abdomenGeo = new THREE.ConeGeometry(0.07, 0.5, 8);
  const abdomen = new THREE.Mesh(abdomenGeo, darkGreenMat);
  abdomen.rotation.z = -Math.PI / 3;
  abdomen.position.set(-0.25, 0.06, 0);
  group.add(abdomen);

  // Triangular Head
  const headGeo = new THREE.ConeGeometry(0.06, 0.1, 4);
  const head = new THREE.Mesh(headGeo, greenMat);
  head.rotation.z = -Math.PI / 2;
  head.position.set(0.18, 0.24, 0);
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
  const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
  eye1.position.set(0.18, 0.27, 0.04);
  const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
  eye2.position.set(0.18, 0.27, -0.04);
  group.add(eye1);
  group.add(eye2);

  // Raptorial Forelegs
  const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6);
  const arm1 = new THREE.Mesh(armGeo, greenMat);
  arm1.rotation.set(0.3, 0, -Math.PI / 3);
  arm1.position.set(0.12, 0.16, 0.05);
  const arm2 = new THREE.Mesh(armGeo, greenMat);
  arm2.rotation.set(-0.3, 0, -Math.PI / 3);
  arm2.position.set(0.12, 0.16, -0.05);
  group.add(arm1);
  group.add(arm2);

  return group;
}

export default function PrayingMantis3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 75;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.8);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(3, 4, 3);
    scene.add(sunLight);

    const bounceLight = new THREE.DirectionalLight(0x86bf9b, 1.0);
    bounceLight.position.set(-2, -1, 1);
    scene.add(bounceLight);

    // --- State Variables for Mantis AI & Motion ---
    let mantisGroup: THREE.Group | null = null;
    let animFrameId: number;

    const computeBounds = () => {
      const vFOV = (camera.fov * Math.PI) / 180;
      const visibleHeightAtOrigin = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleWidthAtOrigin = visibleHeightAtOrigin * camera.aspect;
      return Math.max(0.8, (visibleWidthAtOrigin / 2) * 0.82);
    };

    let boundX = computeBounds();
    let posX = (Math.random() - 0.5) * boundX;
    let targetX = (Math.random() - 0.5) * boundX;
    let state: "WALK" | "PAUSE" = "WALK";
    let pauseTimer = 0;
    let walkSpeed = 0.55;
    let currentFacingAngle = targetX >= posX ? Math.PI / 2 : -Math.PI / 2;
    let targetFacingAngle = currentFacingAngle;
    let walkCycle = 0;
    let hopOffset = 0;
    let hopVelocity = 0;

    // Attach loaded model to scene
    const attachMantis = (group: THREE.Group) => {
      mantisGroup = group;
      mantisGroup.position.set(posX, 0.05, 0);
      mantisGroup.rotation.y = currentFacingAngle;
      scene.add(mantisGroup);
      setIsLoaded(true);
      setProgress(null);
    };

    // --- Load GLB with fallback & progress ---
    const loader = new GLTFLoader();

    // 12-second safety timeout: if slow Wi-Fi hangs or LFS fails, seamlessly load procedural 3D mantis
    const timeoutId = setTimeout(() => {
      if (!mantisGroup) {
        console.info("Using lightweight 3D mantis fallback for immediate responsiveness.");
        attachMantis(createProceduralMantis());
      }
    }, 12000);

    loader.load(
      "/models/praying_mantis.glb",
      (gltf) => {
        clearTimeout(timeoutId);
        if (mantisGroup) return; // already loaded or fallback used

        const root = gltf.scene;
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const scaleFactor = 1.35 / maxDim;
        root.scale.set(scaleFactor, scaleFactor, scaleFactor);
        root.position.x = -center.x * scaleFactor;
        root.position.y = -center.y * scaleFactor;
        root.position.z = -center.z * scaleFactor;

        const newGroup = new THREE.Group();
        newGroup.add(root);
        attachMantis(newGroup);
      },
      (xhr) => {
        if (xhr.total && xhr.total > 0) {
          const pct = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
          setProgress(pct);
        }
      },
      (error) => {
        console.warn("Could not load /models/praying_mantis.glb; activating 3D fallback:", error);
        clearTimeout(timeoutId);
        if (!mantisGroup) {
          attachMantis(createProceduralMantis());
        }
      }
    );

    // --- Resize Observer ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
          boundX = computeBounds();
          posX = Math.max(-boundX, Math.min(boundX, posX));
          if (mantisGroup) mantisGroup.position.x = posX;
        }
      }
    });

    resizeObserver.observe(container);

    // --- Animation Loop ---
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!mantisGroup) {
        renderer.render(scene, camera);
        return;
      }

      // Hop Physics
      if (hopOffset > 0 || hopVelocity !== 0) {
        hopOffset += hopVelocity * delta;
        hopVelocity -= 9.8 * delta;
        if (hopOffset <= 0) {
          hopOffset = 0;
          hopVelocity = 0;
        }
      }

      // Roaming State Machine
      if (state === "PAUSE") {
        pauseTimer -= delta;
        mantisGroup.rotation.z = Math.sin(time * 0.003) * 0.02;
        mantisGroup.position.y = 0.05 + Math.sin(time * 0.004) * 0.015 + hopOffset;

        if (pauseTimer <= 0) {
          const dirBias = posX > 0 ? -1 : 1;
          const randomDistance = (0.4 + Math.random() * 0.6) * boundX;
          targetX = Math.max(-boundX, Math.min(boundX, posX + dirBias * randomDistance));

          targetFacingAngle = targetX >= posX ? Math.PI / 2 : -Math.PI / 2;
          walkSpeed = 0.45 + Math.random() * 0.45;
          state = "WALK";
        }
      } else if (state === "WALK") {
        const dx = targetX - posX;
        const dist = Math.abs(dx);

        let diffAngle = targetFacingAngle - currentFacingAngle;
        while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
        while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
        currentFacingAngle += diffAngle * Math.min(1, delta * 9);
        mantisGroup.rotation.y = currentFacingAngle;

        if (dist < 0.04) {
          state = "PAUSE";
          pauseTimer = 1.2 + Math.random() * 1.6;
        } else {
          const step = Math.sign(dx) * Math.min(dist, walkSpeed * delta);
          posX += step;
          mantisGroup.position.x = posX;

          walkCycle += delta * walkSpeed * 14;
          mantisGroup.position.y = 0.05 + Math.abs(Math.sin(walkCycle)) * 0.04 + hopOffset;
          mantisGroup.rotation.z = Math.sin(walkCycle) * 0.035;
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    const handleClick = () => {
      hopVelocity = 2.4;
      const msg = SPEECH_MESSAGES[Math.floor(Math.random() * SPEECH_MESSAGES.length)];
      setSpeech(msg);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => setSpeech(null), 3200);
    };

    container.addEventListener("click", handleClick);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      container.removeEventListener("click", handleClick);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

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
    <div className="relative w-full h-[70px] sm:h-[85px] pointer-events-none select-none z-20">
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-auto cursor-pointer"
        title="Click the praying mantis to interact!"
      />

      {speech && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest-950/95 px-3 py-1 text-[11px] font-mono font-bold text-emerald-200 border border-emerald-500/40 shadow-lg pointer-events-none animate-bounce">
          {speech}
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-emerald-400/60 bg-bark-950/40 rounded-xl backdrop-blur-sm">
          <span>Loading 3D Mantis{progress !== null ? ` (${progress}%)` : "..."}</span>
        </div>
      )}
    </div>
  );
}
