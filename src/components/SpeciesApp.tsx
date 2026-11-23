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
  const [startWithCover, setStartWithCover] = useState(false);

  // When clicking "View in Scrapbook Mode" on a card -> open directly to that page
  const handleOpenFromCard = (index: number = 0) => {
    setSelectedPageIndex(index);
    setStartWithCover(false);
    setIsScrapbookOpen(true);
  };

  // When clicking floating book button at bottom right -> show book cover first
  const handleOpenFromFloatingButton = () => {
    setStartWithCover(true);
    setIsScrapbookOpen(true);
  };

  const handleCloseScrapbook = () => {
    setIsScrapbookOpen(false);
  };

  return (
    <main className="relative min-h-screen">
      {/* Background Permanent Rainforest Rain Droplets (Toggle Removed) */}
      <RainCanvas />

      {/* Main UI 2: Row & Column Catalog View */}
      <CatalogView
        speciesList={initialSpecies}
        dataSource={dataSource}
        onOpenScrapbook={handleOpenFromCard}
      />

      {/* Floating Book Trigger Button (Bottom-Right) - Opens to Cover First */}
      <FloatingBookButton
        onClick={handleOpenFromFloatingButton}
        count={initialSpecies.length}
      />

      {/* UI 1: Modal Scrapbook Experience (ESC anytime to close) */}
      <ScrapbookModal
        isOpen={isScrapbookOpen}
        onClose={handleCloseScrapbook}
        speciesList={initialSpecies}
        initialIndex={selectedPageIndex}
        initialShowCover={startWithCover}
      />
    </main>
  );
}
