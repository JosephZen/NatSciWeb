import { NextResponse } from "next/server";
import { getSpeciesList } from "@/lib/species";

export async function GET() {
  const result = await getSpeciesList();
  return NextResponse.json({
    total: result.data.length,
    source: result.source,
    species: result.data,
  });
}
