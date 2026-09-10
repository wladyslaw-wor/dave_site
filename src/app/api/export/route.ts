import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getFullState } from "@/lib/content";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const state = await getFullState();

  return NextResponse.json(state, {
    headers: {
      "Content-Disposition": 'attachment; filename="dave-devine-site.json"',
    },
  });
}
