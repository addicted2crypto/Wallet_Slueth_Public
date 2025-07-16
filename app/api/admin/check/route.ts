import { NextResponse } from "next/server";

export async function GET() {
  const currentKey = process.env.SNOWSCAN_API_KEY || "";
  const isAdminMode = currentKey === "test";

  return NextResponse.json({
    adminMode: isAdminMode,
    currentKey: currentKey,
    message: isAdminMode
      ? "Admin mode enabled"
      : currentKey
      ? "Live API key configured"
      : "No API key configured",
  });
}
