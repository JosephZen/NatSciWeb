"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Filter, BookOpen, Sparkles, LayoutGrid, ListFilter, Leaf, ExternalLink, Database } from "lucide-react";
import { SpeciesItem } from "@/lib/species";
import SpeciesImage from "./SpeciesImage";

interface CatalogViewProps {
  speciesList: SpeciesItem[];
  dataSource: "neon" | "local";
  onOpenScrapbook: (index: number) => void;
}

export default function CatalogView({
  speciesList,
  dataSource,
  onOpenScrapbook,
}: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "rows">("grid");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    speciesList.forEach((s) => set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [speciesList]);

  // Filtered items
  const filteredList = useMemo(() => {
    return speciesList.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.commonName.toLowerCase().includes(q) ||
        item.scientificName.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.funFact.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [speciesList, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Banner / Hero Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/80 border border-forest-600/50 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-4 shadow-sm backdrop-blur-sm">
          <Leaf className="h-3.5 w-3.5" />
          <span>Campus Biodiversity Catalog</span>
          <span className="text-parchment-400">•</span>
          <span className="text-parchment-200">60 Unique Species</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black text-parchment-100 tracking-tight drop-shadow-md">
          Picture Book of Wild Life & Plants
        </h1>

        <p className="mt-3 text-sm sm:text-base text-parchment-300 max-w-2xl mx-auto leading-relaxed">
          An interactive field observation guide documenting campus flora, fauna, insects, and arachnids. Browse the catalog below or launch the animated scrapbook modal anytime.
        </p>

        {/* Database Status Tag */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-bark-900/80 border border-bark-700/80 text-parchment-300">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Data Source: </span>
            <strong className={dataSource === "neon" ? "text-emerald-400" : "text-amber-300"}>
              {dataSource === "neon" ? "Neon Serverless Postgres" : "Local Verified Dataset (Ready for Neon)"}
            </strong>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-bark-900/70 border border-bark-700/80 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by common name, scientific name, or keywords..."
              className="w-full rounded-xl bg-bark-950/80 pl-10 pr-4 py-2.5 text-sm text-parchment-100 placeholder-parchment-400 border border-bark-700 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-parchment-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-bark-950/80 p-1 rounded-xl border border-bark-700 self-end md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-forest-700 text-white shadow-sm"
                  : "text-parchment-300 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode("rows")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "rows"
                  ? "bg-forest-700 text-white shadow-sm"
                  : "text-parchment-300 hover:text-white"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Row View</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-bark-800/80 pb-1 scrollbar-thin">
          <Filter className="h-3.5 w-3.5 text-parchment-400 flex-shrink-0" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === "All"
                ? speciesList.length
                : speciesList.filter((s) => s.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-forest-600 text-white border border-forest-400/50 shadow-md scale-105"
                    : "bg-bark-950/60 text-parchment-300 hover:bg-bark-800 hover:text-white border border-bark-800"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? "bg-forest-800 text-emerald-200" : "bg-bark-900 text-parchment-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-xs text-parchment-300 font-mono">
        <span>
          Showing {filteredList.length} of {speciesList.length} documented specimens
        </span>
        {searchQuery && (
          <span>
            Filtering by &quot;{searchQuery}&quot;
          </span>
        )}
      </div>

      {/* No Results Fallback */}
      {filteredList.length === 0 && (
        <div className="text-center py-16 bg-bark-900/40 rounded-2xl border border-bark-800 text-parchment-300">
          <p className="text-lg font-serif">No species found matching your query.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-forest-700 text-white text-xs font-semibold hover:bg-forest-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* DISPLAY MODE 1: GRID CARDS */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const originalIndex = speciesList.findIndex((s) => s.id === item.id);

            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl bg-[#FAF6EE] text-bark-900 border border-parchment-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* Top Image Section with Static Plain Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-200 border-b border-parchment-300">
                  <SpeciesImage
                    src={item.imagePath}
                    alt={item.commonName}
                    category={item.category}
                    commonName={item.commonName}
                    scientificName={item.scientificName}
                    className="group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Category Stamp Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-bark-900/85 backdrop-blur-sm text-parchment-100 text-[10px] font-mono font-bold tracking-wider uppercase border border-bark-700">
                    {item.category}
                  </span>

                  {/* Specimen Index */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-forest-900/85 text-emerald-300 text-[10px] font-mono font-bold">
                    #{item.id.toString().padStart(3, "0")}
                  </span>
                </div>

                {/* Content Details in User's Exact Format */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Common Name */}
                    <div className="mb-1">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-forest-700 block">
                        Common Name
                      </span>
                      <h2 className="text-xl font-serif font-black text-bark-900 leading-snug">
                        {item.commonName}
                      </h2>
                    </div>

                    {/* Scientific Name */}
                    <div className="mb-3">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-forest-700 block">
                        Scientific Name
                      </span>
                      <p className="text-xs font-serif italic text-forest-800 font-semibold">
                        {item.scientificName}
                      </p>
                    </div>

                    {/* Origin */}
                    <div className="mb-3 text-xs leading-relaxed text-stone-700">
                      <span className="font-bold text-bark-900">Origin: </span>
                      <span>{item.origin}</span>
                    </div>

                    {/* Description */}
                    <div className="mb-3 text-xs leading-relaxed text-stone-700">
                      <span className="font-bold text-bark-900">Description: </span>
                      <span>{item.description}</span>
                    </div>

                    {/* Fun Fact */}
                    <div className="rounded-lg bg-[#FFF9C4] p-3 text-xs border-l-4 border-amber-400 text-stone-900 shadow-sm">
                      <strong className="text-amber-900 block mb-0.5 font-sans">
                        💡 Fun Fact:
                      </strong>
                      <span className="font-serif leading-relaxed">
                        {item.funFact}
                      </span>
                    </div>
                  </div>

                  {/* Action: Open in Scrapbook */}
                  <div className="pt-3 border-t border-parchment-200 mt-4">
                    <button
                      onClick={() => onOpenScrapbook(originalIndex)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-forest-800 text-parchment-100 text-xs font-semibold hover:bg-forest-700 transition-colors shadow-sm group/btn"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                      <span>View in Scrapbook Mode</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* DISPLAY MODE 2: ROW-COLUMN LIST */}
      {viewMode === "rows" && (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const originalIndex = speciesList.findIndex((s) => s.id === item.id);

            return (
              <article
                key={item.id}
                className="flex flex-col md:flex-row items-stretch rounded-2xl bg-[#FAF6EE] text-bark-900 border border-parchment-300 shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Left Photo Column */}
                <div className="relative w-full md:w-64 lg:w-80 min-h-[180px] overflow-hidden bg-stone-200 flex-shrink-0">
                  <SpeciesImage
                    src={item.imagePath}
                    alt={item.commonName}
                    category={item.category}
                    commonName={item.commonName}
                    scientificName={item.scientificName}
                    sizes="320px"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-bark-900/85 text-parchment-100 text-[10px] font-mono font-bold uppercase">
                    {item.category}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-forest-900/90 text-emerald-300 text-[10px] font-mono font-bold">
                    SPECIMEN #{item.id}
                  </span>
                </div>

                {/* Right Text Details Column */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-parchment-300">
                      <div>
                        <h2 className="text-xl font-serif font-black text-bark-900">
                          <span className="font-sans text-xs uppercase font-bold text-forest-700 block sm:inline sm:mr-2">Common Name:</span>
                          {item.commonName}
                        </h2>
                        <p className="text-xs font-serif italic text-forest-800 font-semibold">
                          <span className="font-sans font-bold not-italic text-stone-600">Scientific Name: </span>
                          {item.scientificName}
                        </p>
                      </div>

                      <button
                        onClick={() => onOpenScrapbook(originalIndex)}
                        className="self-start sm:self-auto flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-forest-800 text-parchment-100 text-xs font-semibold hover:bg-forest-700 transition-colors shadow-sm mt-2 sm:mt-0 flex-shrink-0"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Scrapbook Page #{item.id}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3 text-xs leading-relaxed">
                      <div>
                        <strong className="text-bark-900 block font-semibold mb-0.5">Origin:</strong>
                        <p className="text-stone-700">{item.origin}</p>
                      </div>

                      <div>
                        <strong className="text-bark-900 block font-semibold mb-0.5">Description:</strong>
                        <p className="text-stone-700">{item.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-[#FFF9C4] p-3 text-xs border-l-4 border-amber-400 text-stone-900">
                      <strong className="text-amber-900 block mb-0.5">💡 Fun Fact:</strong>
                      <span className="font-serif">{item.funFact}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
