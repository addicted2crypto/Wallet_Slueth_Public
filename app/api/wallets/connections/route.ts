import { type NextRequest, NextResponse } from "next/server";
import { WalletTrackingAPI } from "@/lib/apiIntegrations";

const walletAPI = new WalletTrackingAPI();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid address format" },
      { status: 400 }
    );
  }

  try {
    const connections = await walletAPI.getWalletConnections(address);
    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error fetching wallet connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet connections" },
      { status: 500 }
    );
  }
}
