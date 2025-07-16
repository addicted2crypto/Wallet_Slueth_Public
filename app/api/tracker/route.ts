import { type NextRequest, NextResponse } from "next/server";
import { getTracker } from "@/lib/erc20Tracker";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const tracker = getTracker();

  try {
    switch (action) {
      case "status":
        return NextResponse.json({
          isRunning: tracker.isTrackerRunning(),
          wallets: tracker.getWallets(),
          alerts: tracker.getAlerts(),
        });

      case "alerts":
        return NextResponse.json({
          alerts: tracker.getAlerts(),
        });

      case "wallets":
        return NextResponse.json({
          wallets: tracker.getWallets(),
        });

      case "test-apis":
        const testResults = await tracker.testApiConnections();
        return NextResponse.json(testResults);

      case "sample-addresses":
        const network = searchParams.get("network") as "ethereum" | "avalanche";
        if (!network || !["ethereum", "avalanche"].includes(network)) {
          return NextResponse.json(
            { error: "Valid network parameter required" },
            { status: 400 }
          );
        }
        return NextResponse.json({
          network,
          addresses: tracker.getSampleAddresses(network),
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Tracker API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const tracker = getTracker();

  try {
    const body = await request.json();
    const { action, address, label, network, alertId, intervalMinutes } = body;

    switch (action) {
      case "add-wallet":
        if (!address || !label || !network) {
          return NextResponse.json(
            { error: "Address, label, and network are required" },
            { status: 400 }
          );
        }
        if (!["ethereum", "avalanche"].includes(network)) {
          return NextResponse.json(
            { error: "Network must be 'ethereum' or 'avalanche'" },
            { status: 400 }
          );
        }
        tracker.addWallet(address, label, network);
        return NextResponse.json({
          success: true,
          message: "Wallet added successfully",
        });

      case "remove-wallet":
        if (!address || !network) {
          return NextResponse.json(
            { error: "Address and network are required" },
            { status: 400 }
          );
        }
        tracker.removeWallet(address, network);
        return NextResponse.json({
          success: true,
          message: "Wallet removed successfully",
        });

      case "start":
        const interval = intervalMinutes || 1;
        tracker.start(interval);
        return NextResponse.json({
          success: true,
          message: `Tracker started with ${interval} minute intervals`,
        });

      case "stop":
        tracker.stop();
        return NextResponse.json({ success: true, message: "Tracker stopped" });

      case "check-now":
        await tracker.runCheck();
        return NextResponse.json({
          success: true,
          message: "Manual check completed",
        });

      case "mark-read":
        if (!alertId) {
          return NextResponse.json(
            { error: "Alert ID is required" },
            { status: 400 }
          );
        }
        tracker.markAlertAsRead(alertId);
        return NextResponse.json({
          success: true,
          message: "Alert marked as read",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Tracker API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
