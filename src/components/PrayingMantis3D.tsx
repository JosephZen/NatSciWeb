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

export default function PrayingMantis3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 75;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Camera positioned slightly elevated to view the mantis from a natural 3/4 top-front perspective
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

    // Warm tropical sunlight from top-left
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(3, 4, 3);
    scene.add(sunLight);

    // Soft emerald bounce light from foliage below
    const bounceLight = new THREE.DirectionalLight(0x86bf9b, 1.0);
    bounceLight.position.set(-2, -1, 1);
    scene.add(bounceLight);

    // --- State Variables for Mantis AI & Motion ---
    let mantisGroup: THREE.Group | null = null;
    let animFrameId: number;

    // Boundary calculation in world space based on camera FOV and aspect ratio
    const computeBounds = () => {
      const vFOV = (camera.fov * Math.PI) / 180;
      const visibleHeightAtOrigin = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleWidthAtOrigin = visibleHeightAtOrigin * camera.aspect;
      // Keep within 82% of visible width so it never clips off-screen
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

    // --- Load GLB Model ---
    const loader = new GLTFLoader();
    loader.load(
      "/models/praying_mantis.glb",
      (gltf) => {
        const root = gltf.scene;

        // Auto-center and normalize size to a balanced scale
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Target length ~1.35 world units (visible, detailed, but non-intrusive)
        const scaleFactor = 1.35 / maxDim;
        root.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center the geometry so its pivot is right in the middle
        root.position.x = -center.x * scaleFactor;
        root.position.y = -center.y * scaleFactor;
        root.position.z = -center.z * scaleFactor;

        // Wrap inside an outer group for world positioning & orientation
        mantisGroup = new THREE.Group();
        mantisGroup.add(root);

        // Align baseline so feet touch the border
        mantisGroup.position.set(posX, 0.05, 0);
        mantisGroup.rotation.y = currentFacingAngle;

        scene.add(mantisGroup);
        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.warn("Failed to load /models/praying_mantis.glb:", error);
      }
    );

    // --- Resize Observer (dynamically adapts to device aspect ratio) ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
          boundX = computeBounds();
          // Clamp position within new bounds if resized
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

      // Handle Hop Physics (from user click)
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

        // Gentle breathing and antenna sway while paused
        mantisGroup.rotation.z = Math.sin(time * 0.003) * 0.02;
        mantisGroup.position.y = 0.05 + Math.sin(time * 0.004) * 0.015 + hopOffset;

        if (pauseTimer <= 0) {
          // Choose a new target across the border
          // Bias towards moving in the opposite direction for nice pacing
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

        // Smoothly turn towards facing direction
        // Lerp rotation angle
        let diffAngle = targetFacingAngle - currentFacingAngle;
        while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
        while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
        currentFacingAngle += diffAngle * Math.min(1, delta * 9);
        mantisGroup.rotation.y = currentFacingAngle;

        if (dist < 0.04) {
          // Reached destination, pause for 1.2 to 2.8 seconds
          state = "PAUSE";
          pauseTimer = 1.2 + Math.random() * 1.6;
        } else {
          // Walk forward
          const step = Math.sign(dx) * Math.min(dist, walkSpeed * delta);
          posX += step;
          mantisGroup.position.x = posX;

          walkCycle += delta * walkSpeed * 14;

          // Organic walking bobbing and subtle sway
          mantisGroup.position.y = 0.05 + Math.abs(Math.sin(walkCycle)) * 0.04 + hopOffset;
          mantisGroup.rotation.z = Math.sin(walkCycle) * 0.035;
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // Interactive click on mantis: triggers a playful hop and speech bubble
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
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-auto cursor-pointer"
        title="Click the praying mantis to interact!"
      />

      {/* Playful Floating Speech Bubble when clicked */}
      {speech && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest-950/95 px-3 py-1 text-[11px] font-mono font-bold text-emerald-200 border border-emerald-500/40 shadow-lg pointer-events-none animate-bounce">
          {speech}
        </div>
      )}

      {/* Subtle hint when loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-emerald-400/50">
          Loading 3D Mantis...
        </div>
      )}
    </div>
  );
}
