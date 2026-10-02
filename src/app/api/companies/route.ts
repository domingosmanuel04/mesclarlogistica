import { NextResponse } from "next/server";
import { getCompaniesWithInitialSeed } from "@/lib/companies-seed";

export async function GET() {
  try {
    const companies = await getCompaniesWithInitialSeed();
    return NextResponse.json(companies);
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao obter directório de empresas." }, { status: 500 });
  }
}
