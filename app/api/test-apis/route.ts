import { NextResponse } from "next/server";
import { WalletTrackingAPI } from "@/lib/apiIntegrations";

export async function GET() {
  const api = new WalletTrackingAPI();

  // Test addresses - these are public addresses with known activity
  const testAddresses = [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Vitalik's address
    "0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C", // Random active address
    "0x8ba1f109551bD432803012645Hac136c22C4C4C4", // Another test address
  ];

  const results = [];

  for (const address of testAddresses) {
    try {
      console.log(`Testing API calls for ${address}`);
      const data = await api.getComprehensiveWalletData(address);
      results.push({
        address,
        success: true,
        data: {
          balance: data.balance,
          balanceUSD: data.balanceUSD,
          platform: data.platform,
          transactionCount: data.transactions.length,
          connectionCount: data.connections.length,
          tokenCount: data.tokenBalances?.length || 0,
          labels: data.labels,
          riskScore: data.riskScore,
        },
      });
    } catch (error) {
      results.push({
        address,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    apiKey: process.env.SNOWSCAN_API_KEY ? "configured" : "not configured",
    results,
  });
}
