import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const network = searchParams.get("network") as "ethereum" | "avalanche";

  if (!address || !network) {
    return NextResponse.json(
      { error: "Address and network parameters required" },
      { status: 400 }
    );
  }

  if (!["ethereum", "avalanche"].includes(network)) {
    return NextResponse.json(
      { error: "Network must be 'ethereum' or 'avalanche'" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.SNOWSCAN_API_KEY || "YourApiKeyToken";
    const baseUrl =
      network === "ethereum"
        ? "https://api.etherscan.io/api"
        : "https://api.snowtrace.io/api";

    console.log(`🔍 Debug API call for ${address} on ${network}`);
    console.log(
      `🔑 API Key: ${apiKey === "YourApiKeyToken" ? "Free tier" : "Configured"}`
    );

    // Get latest block first
    const latestBlockUrl = `${baseUrl}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`;
    console.log(`📡 Latest block URL: ${latestBlockUrl}`);

    const latestBlockResponse = await fetch(latestBlockUrl);
    const latestBlockData = await latestBlockResponse.json();
    const latestBlock = latestBlockData.result
      ? Number.parseInt(latestBlockData.result, 16)
      : 0;

    console.log(`📊 Latest block: ${latestBlock}`);

    // Test different block ranges
    const ranges = [
      {
        name: "Last 100 blocks",
        from: Math.max(0, latestBlock - 100),
        to: latestBlock,
      },
      {
        name: "Last 1000 blocks",
        from: Math.max(0, latestBlock - 1000),
        to: latestBlock,
      },
      {
        name: "Last 10000 blocks",
        from: Math.max(0, latestBlock - 10000),
        to: latestBlock,
      },
      { name: "All transactions", from: 0, to: 999999999 },
    ];

    const results = [];

    for (const range of ranges) {
      const tokenTxUrl = `${baseUrl}?module=account&action=tokentx&address=${address}&startblock=${range.from}&endblock=${range.to}&sort=desc&apikey=${apiKey}`;

      console.log(
        `📡 Testing range: ${range.name} (${range.from} to ${range.to})`
      );
      console.log(`📡 URL: ${tokenTxUrl}`);

      try {
        const response = await fetch(tokenTxUrl, {
          headers: {
            "User-Agent": "WalletTrace/1.0",
            Accept: "application/json",
          },
        });

        const data = await response.json();

        console.log(`📊 Response for ${range.name}:`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Message: ${data.message}`);
        console.log(
          `   Result type: ${
            Array.isArray(data.result) ? "array" : typeof data.result
          }`
        );
        console.log(
          `   Count: ${Array.isArray(data.result) ? data.result.length : "N/A"}`
        );

        const result = {
          range: range.name,
          blockRange: `${range.from}-${range.to}`,
          httpStatus: response.status,
          apiStatus: data.status,
          apiMessage: data.message,
          transactionCount: Array.isArray(data.result) ? data.result.length : 0,
          transactions: Array.isArray(data.result)
            ? data.result.slice(0, 5)
            : [],
          rawResponse: data,
        };

        results.push(result);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Error testing range ${range.name}:`, error);
        results.push({
          range: range.name,
          blockRange: `${range.from}-${range.to}`,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Also test regular transactions (not just token transactions)
    const regularTxUrl = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;
    console.log(`📡 Testing regular transactions: ${regularTxUrl}`);

    try {
      const regularResponse = await fetch(regularTxUrl);
      const regularData = await regularResponse.json();

      results.push({
        range: "Regular transactions",
        blockRange: "0-99999999",
        httpStatus: regularResponse.status,
        apiStatus: regularData.status,
        apiMessage: regularData.message,
        transactionCount: Array.isArray(regularData.result)
          ? regularData.result.length
          : 0,
        transactions: Array.isArray(regularData.result)
          ? regularData.result.slice(0, 3)
          : [],
      });
    } catch (error) {
      console.error(`❌ Error testing regular transactions:`, error);
    }

    return NextResponse.json({
      address,
      network,
      latestBlock,
      apiEndpoint: baseUrl,
      apiKey: apiKey === "YourApiKeyToken" ? "Free tier" : "Configured",
      timestamp: new Date().toISOString(),
      testResults: results,
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        address,
        network,
      },
      { status: 500 }
    );
  }
}
