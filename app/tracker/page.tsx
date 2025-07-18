"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Square,
  Plus,
  Trash2,
  Bell,
  BellOff,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  CheckCircle,
  TestTube,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react"
import Link from "next/link"
import type { TrackedWallet, Alert } from "@/lib/erc20-tracker"

const MAX_WALLETS = 10

export default function TrackerPage() {
  const [wallets, setWallets] = useState<TrackedWallet[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState<"ethereum" | "avalanche">("ethereum")
  const [intervalMinutes, setIntervalMinutes] = useState(1)
  const [apiTestResults, setApiTestResults] = useState<any>(null)
  const [showAddresses, setShowAddresses] = useState(false)
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set())

  // Fetch status on component mount and set up polling
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const getWalletTransactions = (walletAddress: string, network: "ethereum" | "avalanche", limit = 3) => {
    return alerts
      .filter(
        (alert) =>
          alert.walletAddress.toLowerCase() === walletAddress.toLowerCase() && alert.transaction.network === network,
      )
      .slice(0, limit)
  }

  const toggleWalletExpansion = (walletAddress: string, network: "ethereum" | "avalanche") => {
    const key = `${network}:${walletAddress.toLowerCase()}`
    const newExpanded = new Set(expandedWallets)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedWallets(newExpanded)
  }

  const isWalletExpanded = (walletAddress: string, network: "ethereum" | "avalanche") => {
    const key = `${network}:${walletAddress.toLowerCase()}`
    return expandedWallets.has(key)
  }

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/tracker?action=status")
      const data = await response.json()
      setWallets(data.wallets || [])
      setAlerts(data.alerts || [])
      setIsRunning(data.isRunning || false)
    } catch (error) {
      console.error("Error fetching status:", error)
    }
  }

  const testApis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tracker?action=test-apis")
      const data = await response.json()
      setApiTestResults(data)
    } catch (error) {
      console.error("Error testing APIs:", error)
      setApiTestResults({ error: "Failed to test APIs" })
    } finally {
      setIsLoading(false)
    }
  }

  const addWallet = async () => {
    if (!newAddress.trim() || !newLabel.trim()) return

    if (wallets.length >= MAX_WALLETS) {
      alert(`Maximum of ${MAX_WALLETS} wallets allowed`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-wallet",
          address: newAddress.trim(),
          label: newLabel.trim(),
          network: selectedNetwork,
        }),
      })

      if (response.ok) {
        setNewAddress("")
        setNewLabel("")
        fetchStatus()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add wallet")
      }
    } catch (error) {
      console.error("Error adding wallet:", error)
      alert("Failed to add wallet")
    } finally {
      setIsLoading(false)
    }
  }

  const removeWallet = async (address: string, network: "ethereum" | "avalanche") => {
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove-wallet",
          address,
          network,
        }),
      })

      if (response.ok) {
        fetchStatus()
      }
    } catch (error) {
      console.error("Error removing wallet:", error)
    }
  }

  const startTracker = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          intervalMinutes,
        }),
      })

      if (response.ok) {
        fetchStatus()
      }
    } catch (error) {
      console.error("Error starting tracker:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const stopTracker = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      })

      if (response.ok) {
        fetchStatus()
      }
    } catch (error) {
      console.error("Error stopping tracker:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkNow = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-now" }),
      })

      if (response.ok) {
        setTimeout(fetchStatus, 1000) // Fetch status after a delay
      }
    } catch (error) {
      console.error("Error running manual check:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark-read",
          alertId,
        }),
      })
      fetchStatus()
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const formatAddress = (address: string, blur = false) => {
    if (blur && !showAddresses) {
      return "0x••••••••••••••••••••••••••••••••••••••••"
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatFullAddress = (address: string, blur = false) => {
    if (blur && !showAddresses) {
      return "0x••••••••••••••••••••••••••••••••••••••••"
    }
    return address
  }

  const formatTokenAmount = (value: string, decimals: number) => {
    const amount = BigInt(value)
    const divisor = BigInt(10 ** decimals)
    const quotient = amount / divisor
    const remainder = amount % divisor

    if (remainder === 0n) {
      return quotient.toString()
    }

    const remainderStr = remainder.toString().padStart(decimals, "0")
    const trimmedRemainder = remainderStr.replace(/0+$/, "")

    if (trimmedRemainder === "") {
      return quotient.toString()
    }

    return `${quotient}.${trimmedRemainder}`
  }

  const getNetworkBadgeColor = (network: "ethereum" | "avalanche") => {
    return network === "ethereum" ? "bg-blue-600" : "bg-red-600"
  }

  const getExplorerUrl = (network: "ethereum" | "avalanche", txHash: string) => {
    const baseUrl = network === "ethereum" ? "https://etherscan.io" : "https://snowtrace.io"
    return `${baseUrl}/tx/${txHash}`
  }

  const renderTransaction = (alert: Alert, isCompact = false) => {
    const tx = alert.transaction
    const isOutgoing = tx.from.toLowerCase() === alert.walletAddress.toLowerCase()
    const amount = formatTokenAmount(tx.value, tx.decimals)

    return (
      <div
        key={alert.id}
        className={`${isCompact ? "p-2 bg-slate-600/30" : "p-3 bg-slate-600/50"} rounded border border-slate-600/50`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOutgoing ? (
              <ArrowUpRight className="h-3 w-3 text-red-400" />
            ) : (
              <ArrowDownLeft className="h-3 w-3 text-green-400" />
            )}
            <span className={`text-xs font-medium ${isOutgoing ? "text-red-400" : "text-green-400"}`}>
              {isOutgoing ? "SENT" : "RECEIVED"}
            </span>
            <span className="text-white text-sm font-semibold">
              {amount} {tx.tokenSymbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</span>
            <a
              href={getExplorerUrl(tx.network, tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        {!isCompact && (
          <div className="mt-2 text-xs text-gray-400 space-y-1">
            <div>
              {isOutgoing ? "To" : "From"}: {formatAddress(isOutgoing ? tx.to : tx.from, true)}
            </div>
            <div>
              Token: {tx.tokenName} ({tx.tokenSymbol})
            </div>
            <div>Hash: {formatAddress(tx.hash, true)}</div>
            <div>Time: {new Date(tx.timestamp).toLocaleString()}</div>
          </div>
        )}
      </div>
    )
  }

  const unreadAlerts = alerts.filter((alert) => !alert.isRead)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-white">
              Wills ERC20 Tracker
            </Link>
            <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-green-600" : "bg-gray-600"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              {wallets.length}/{MAX_WALLETS} Wallets
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowAddresses(!showAddresses)}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-white"
            >
              {showAddresses ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showAddresses ? "Hide" : "Show"} Addresses
            </Button>
            <Button
              onClick={testApis}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isLoading}
            >
              <TestTube className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Test APIs
            </Button>
            <Button
              onClick={checkNow}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Check Now
            </Button>
            {isRunning ? (
              <Button onClick={stopTracker} variant="destructive" size="sm" disabled={isLoading}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button onClick={startTracker} className="bg-green-600 hover:bg-green-700" size="sm" disabled={isLoading}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* API Test Results */}
        {apiTestResults && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API Connection Test Results
              </CardTitle>
              <CardDescription className="text-gray-400">Testing connectivity to blockchain APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Ethereum API Test */}
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Ethereum (Etherscan)</span>
                    {apiTestResults.ethereum?.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{apiTestResults.ethereum?.message || "No result"}</div>
                  {apiTestResults.ethereum?.data && (
                    <div className="text-xs text-gray-500 mt-1">Endpoint: {apiTestResults.ethereum.data.endpoint}</div>
                  )}
                </div>

                {/* Avalanche API Test */}
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Avalanche (Snowtrace)</span>
                    {apiTestResults.avalanche?.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{apiTestResults.avalanche?.message || "No result"}</div>
                  {apiTestResults.avalanche?.data && (
                    <div className="text-xs text-gray-500 mt-1">Endpoint: {apiTestResults.avalanche.data.endpoint}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Tracked Wallets</CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {wallets.length}/{MAX_WALLETS}
              </div>
              <p className="text-xs text-blue-400">
                ETH: {wallets.filter((w) => w.network === "ethereum").length} | AVAX:{" "}
                {wallets.filter((w) => w.network === "avalanche").length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Alerts</CardTitle>
              <Bell className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
              <p className="text-xs text-purple-400">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Unread Alerts</CardTitle>
              <BellOff className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{unreadAlerts.length}</div>
              <p className="text-xs text-red-400">Need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Monitoring Status</CardTitle>
              <RefreshCw className={`h-4 w-4 ${isRunning ? "text-green-400 animate-spin" : "text-gray-400"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{isRunning ? "ACTIVE" : "STOPPED"}</div>
              <p className="text-xs text-green-400">
                {isRunning ? `Checking every ${intervalMinutes}m` : "Click Start to begin"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="wallets" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="wallets" className="text-white">
              Wallets
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-white">
              Alerts {unreadAlerts.length > 0 && <Badge className="ml-2 bg-red-600">{unreadAlerts.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallets">
            <div className="space-y-6">
              {/* Add Wallet */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Add Wallet to Track</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor any Ethereum or Avalanche address for ERC20 token transactions (Max {MAX_WALLETS} wallets)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="address" className="text-white">
                        Wallet Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="0x..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="label" className="text-white">
                        Label
                      </Label>
                      <Input
                        id="label"
                        placeholder="My Wallet"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="network" className="text-white">
                        Network
                      </Label>
                      <select
                        id="network"
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value as "ethereum" | "avalanche")}
                        className="w-full h-10 px-3 bg-slate-700 border border-slate-600 text-white rounded-md"
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="avalanche">Avalanche</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addWallet}
                        className="bg-purple-600 hover:bg-purple-700 w-full"
                        disabled={isLoading || !newAddress.trim() || !newLabel.trim() || wallets.length >= MAX_WALLETS}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Wallet
                      </Button>
                    </div>
                  </div>
                  {wallets.length >= MAX_WALLETS && (
                    <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        Maximum wallet limit reached ({MAX_WALLETS}). Remove a wallet to add a new one.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tracked Wallets */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Tracked Wallets</CardTitle>
                  <CardDescription className="text-gray-400">
                    Currently monitoring {wallets.length} of {MAX_WALLETS} allowed wallets with recent ERC20
                    transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {wallets.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No wallets being tracked yet. Add a wallet address above to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wallets.map((wallet) => {
                        const walletTransactions = getWalletTransactions(wallet.address, wallet.network, 3)
                        const allWalletTransactions = getWalletTransactions(wallet.address, wallet.network, 20)
                        const isExpanded = isWalletExpanded(wallet.address, wallet.network)
                        const transactionsToShow = isExpanded ? allWalletTransactions : walletTransactions

                        return (
                          <div
                            key={`${wallet.network}-${wallet.address}`}
                            className="bg-slate-700/50 rounded-lg border border-slate-600"
                          >
                            {/* Wallet Header */}
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    wallet.network === "ethereum" ? "bg-blue-600" : "bg-red-600"
                                  }`}
                                >
                                  <Wallet className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-white font-medium">{wallet.label}</div>
                                  <div className="text-sm text-gray-400 font-mono">
                                    {formatFullAddress(wallet.address, true)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span>Last checked block: {wallet.lastCheckedBlock || "Not checked yet"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getNetworkBadgeColor(wallet.network)}>
                                  {wallet.network === "ethereum" ? "ETH" : "AVAX"}
                                </Badge>
                                <Badge variant={wallet.isActive ? "default" : "secondary"}>
                                  {wallet.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-red-400"
                                  onClick={() => removeWallet(wallet.address, wallet.network)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Transactions Section */}
                            <div className="px-4 pb-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-medium text-sm">
                                  Recent ERC20 Transactions ({allWalletTransactions.length})
                                </h4>
                                {allWalletTransactions.length > 3 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleWalletExpansion(wallet.address, wallet.network)}
                                    className="text-purple-400 hover:text-purple-300"
                                  >
                                    {isExpanded ? (
                                      <>
                                        Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                      </>
                                    ) : (
                                      <>
                                        Show More ({allWalletTransactions.length - 3} more){" "}
                                        <ChevronDown className="h-4 w-4 ml-1" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>

                              {transactionsToShow.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                  <div className="text-sm">No ERC20 transactions found yet</div>
                                  <div className="text-xs mt-1">
                                    {wallet.lastCheckedBlock
                                      ? "Monitoring for new transactions..."
                                      : "Start the tracker to begin monitoring"}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {transactionsToShow.map((alert) => renderTransaction(alert, true))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Transaction Alerts</CardTitle>
                <CardDescription className="text-gray-400">
                  Recent ERC20 token transactions from tracked wallets across all networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts yet. Start tracking wallets to see their ERC20 transactions here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {alerts.map((alert) => {
                      const tx = alert.transaction
                      const wallet = wallets.find((w) => w.address === alert.walletAddress)
                      const isOutgoing = tx.from === alert.walletAddress
                      const amount = formatTokenAmount(tx.value, tx.decimals)

                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border ${
                            alert.isRead ? "bg-slate-700/30 border-slate-600" : "bg-slate-700/50 border-purple-500/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isOutgoing ? (
                                  <ArrowUpRight className="h-4 w-4 text-red-400" />
                                ) : (
                                  <ArrowDownLeft className="h-4 w-4 text-green-400" />
                                )}
                                <span className="text-white font-medium">
                                  {wallet?.label || formatAddress(alert.walletAddress, true)}
                                </span>
                                <Badge className={getNetworkBadgeColor(tx.network)}>
                                  {tx.network === "ethereum" ? "ETH" : "AVAX"}
                                </Badge>
                                <span className="text-gray-400">{isOutgoing ? "sent" : "received"}</span>
                                <span className="text-white font-semibold">
                                  {amount} {tx.tokenSymbol}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400 space-y-1">
                                <div>
                                  {isOutgoing ? "To" : "From"}: {formatAddress(isOutgoing ? tx.to : tx.from, true)}
                                </div>
                                <div>
                                  Token: {tx.tokenName} ({tx.tokenSymbol})
                                </div>
                                <div>Time: {new Date(tx.timestamp).toLocaleString()}</div>
                                <div className="flex items-center gap-2">
                                  <span>Hash: {formatAddress(tx.hash, true)}</span>
                                  <a
                                    href={getExplorerUrl(tx.network, tx.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!alert.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(alert.id)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Badge variant={isOutgoing ? "destructive" : "default"}>
                                {isOutgoing ? "OUT" : "IN"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tracker Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure monitoring settings for both Ethereum and Avalanche networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="interval" className="text-white">
                      Check Interval (minutes)
                    </Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      max="60"
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(Number.parseInt(e.target.value) || 1)}
                      className="bg-slate-700 border-slate-600 text-white w-32"
                    />
                    <p className="text-sm text-gray-400 mt-1">How often to check for new transactions (1-60 minutes)</p>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h3 className="text-white font-medium mb-2">Wallet Limits:</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <li>• Maximum {MAX_WALLETS} wallets can be tracked simultaneously</li>
                      <li>• Remove unused wallets to add new ones</li>
                      <li>• Each wallet is checked independently across networks</li>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h3 className="text-white font-medium mb-2">Privacy Features:</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <li>• Use "Show/Hide Addresses" button to toggle address visibility</li>
                      <li>• Addresses are hidden by default for screenshot privacy</li>
                      <li>• Transaction hashes and counterparty addresses are also masked</li>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h3 className="text-white font-medium mb-2">Transaction Display:</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <li>• Shows last 3 transactions per wallet by default</li>
                      <li>• Click "Show More" to expand to last 20 transactions</li>
                      <li>• Transactions are sorted by most recent first</li>
                      <li>• Color-coded: Red for outgoing, Green for incoming</li>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h3 className="text-white font-medium mb-2">API Configuration:</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <li>
                        • <strong>Ethereum:</strong> Uses ETHERSCAN_API_KEY environment variable
                      </li>
                      <li>
                        • <strong>Avalanche:</strong> Uses SNOWSCAN_API_KEY environment variable (snowscan.
                        .io)
                      </li>
                      <li>• Both APIs have free tiers available</li>
                      <li>• Fallback to free tier if API keys not configured</li>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h3 className="text-white font-medium mb-2">How it works:</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Monitor up to {MAX_WALLETS} wallets on any EVM chain</li>
                      <li>• Uses Etherscan API for Ethereum, Snowtrace API for Avalanche</li>
                      <li>
                        • Checks every {intervalMinutes} minute{intervalMinutes !== 1 ? "s" : ""} for new ERC20
                        transactions
                      </li>
                      <li>• Tracks both incoming and outgoing token transfers</li>
                      <li>• Shows real-time alerts with network-specific transaction details</li>
                      <li>• Built-in rate limiting to respect API limits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
