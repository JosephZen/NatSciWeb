"use client";

import React, { useState } from "react";
import RainCanvas from "./RainCanvas";
import CatalogView from "./CatalogView";
import ScrapbookModal from "./ScrapbookModal";
import FloatingBookButton from "./FloatingBookButton";
import { SpeciesItem } from "@/lib/species";

interface SpeciesAppProps {
  initialSpecies: SpeciesItem[];
  dataSource: "neon" | "local";
}

export default function SpeciesApp({
  initialSpecies,
  dataSource,
}: SpeciesAppProps) {
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const handleOpenScrapbook = (index: number = 0) => {
    setSelectedPageIndex(index);
    setIsScrapbookOpen(true);
  };

  const handleCloseScrapbook = () => {
    setIsScrapbookOpen(false);
  };

  return (
    <main className="relative min-h-screen">
      {/* Background Animated Rainforest Rain Droplets */}
      <RainCanvas />

      {/* Main UI 2: Row & Column Catalog View */}
      <CatalogView
        speciesList={initialSpecies}
        dataSource={dataSource}
        onOpenScrapbook={handleOpenScrapbook}
      />

      {/* Floating Book Trigger Button (Bottom-Right) */}
      <FloatingBookButton
        onClick={() => handleOpenScrapbook(selectedPageIndex)}
        count={initialSpecies.length}
      />

      {/* UI 1: Modal Scrapbook Experience (ESC anytime to close) */}
      <ScrapbookModal
        isOpen={isScrapbookOpen}
        onClose={handleCloseScrapbook}
        speciesList={initialSpecies}
        initialIndex={selectedPageIndex}
      />
    </main>
  );
}
