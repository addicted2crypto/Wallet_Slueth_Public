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

  // Validate address format (basic validation)
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid address format" },
      { status: 400 }
    );
  }

  try {
    const walletData = await walletAPI.getComprehensiveWalletData(address);
    return NextResponse.json(walletData);
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, maxDepth } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }
    //will change discoverWalletCluster to accept data
    const clusterData = await walletAPI.discoverWalletCluster(
      address,
      maxDepth || 3
    );
    return NextResponse.json(clusterData);
  } catch (error) {
    console.error("Error analyzing wallet cluster:", error);
    return NextResponse.json(
      { error: "Failed to analyze wallet cluster" },
      { status: 500 }
    );
  }
}
