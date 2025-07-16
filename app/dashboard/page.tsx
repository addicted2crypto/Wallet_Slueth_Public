"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Wallet,
  TrendingUp,
  Network,
  DollarSign,
  Eye,
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  Shield,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

import type { WalletData } from "@/lib/apiIntegrations"
import WalletBubbleMap from '@/components/walletBubbleMap'

export default function DashboardPage() {
  const [searchAddress, setSearchAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trackedWallets, setTrackedWallets] = useState<WalletData[]>([])
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [apiTestResults, setApiTestResults] = useState<any>(null)
  const [isTestingAPIs, setIsTestingAPIs] = useState(false)
  const [totalStats, setTotalStats] = useState({
    totalValue: 0,
    totalWallets: 0,
    totalConnections: 0,
    activeClusters: 0,
  })

  // Check admin mode
  useEffect(() => {
    const checkAdminMode = async () => {
      try {
        const response = await fetch("/api/admin/check")
        const data = await response.json()
        setIsAdminMode(data.adminMode)
      } catch (error) {
        console.error("Failed to check admin mode:", error)
      }
    }
    checkAdminMode()
  }, [])

  const testAPIs = async () => {
    setIsTestingAPIs(true)
    try {
      const response = await fetch("/api/test-apis")
      const data = await response.json()
      setApiTestResults(data)
    } catch (error) {
      console.error("API test failed:", error)
      setApiTestResults({ error: "Failed to test APIs" })
    } finally {
      setIsTestingAPIs(false)
    }
  }

  const handleSearch = async () => {
    if (!searchAddress.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/wallets?address=${encodeURIComponent(searchAddress.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch wallet data")
      }

      // Add to tracked wallets if not already present
      const existingIndex = trackedWallets.findIndex((w) => w.address.toLowerCase() === data.address.toLowerCase())
      if (existingIndex >= 0) {
        // Update existing wallet
        const updated = [...trackedWallets]
        updated[existingIndex] = data
        setTrackedWallets(updated)
      } else {
        // Add new wallet
        setTrackedWallets((prev) => [...prev, data])
      }

      setSearchAddress("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Update total stats when wallets change
  useEffect(() => {
    const stats = trackedWallets.reduce(
      (acc, wallet) => ({
        totalValue: acc.totalValue + wallet.balanceUSD,
        totalWallets: acc.totalWallets + 1,
        totalConnections: acc.totalConnections + wallet.connections.length,
        activeClusters: acc.activeClusters + (wallet.connections.length > 0 ? 1 : 0),
      }),
      { totalValue: 0, totalWallets: 0, totalConnections: 0, activeClusters: 0 },
    )

    setTotalStats(stats)
  }, [trackedWallets])

  const removeWallet = (address: string) => {
    setTrackedWallets((prev) => prev.filter((w) => w.address.toLowerCase() !== address.toLowerCase()))
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTimeSince = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60))
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            WalletTrace
          </Link>
          <div className="flex items-center gap-4">
            <Button
              onClick={testAPIs}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isTestingAPIs}
            >
              {isTestingAPIs ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test APIs
            </Button>
            {isAdminMode && (
              <Link href="/admin">
                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </Button>
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
                API Test Results
              </CardTitle>
              <CardDescription className="text-gray-400">
                Testing real API integrations with sample addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  Test run: {apiTestResults.timestamp} | API Key: {apiTestResults.apiKey}
                </div>
                {apiTestResults.results?.map((result: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-white">{result.address}</span>
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    {result.success ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Platform</div>
                          <div className="text-white">{result.data.platform}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Balance USD</div>
                          <div className="text-white">${result.data.balanceUSD.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Transactions</div>
                          <div className="text-white">{result.data.transactionCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Connections</div>
                          <div className="text-white">{result.data.connectionCount}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">{result.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Add Wallet to Track</CardTitle>
            <CardDescription className="text-gray-400">
              Enter a wallet address to start tracking with real blockchain data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isLoading || !searchAddress.trim()}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {isLoading ? "Tracking..." : "Track Wallet"}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}
            <div className="mt-4 text-xs text-gray-400">
              <p>• Try Vitalik's address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</p>
              <p>• Works with Ethereum and Avalanche addresses</p>
              <p>• Real data from Snowscan, Etherscan, and DeBank APIs</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${totalStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-400">Across all tracked wallets</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Tracked Wallets</CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalWallets}</div>
              <p className="text-xs text-blue-400">Active monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Connections</CardTitle>
              <Network className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.totalConnections}</div>
              <p className="text-xs text-purple-400">Wallet relationships</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Clusters</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStats.activeClusters}</div>
              <p className="text-xs text-orange-400">Connected groups</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="bubble-map" className="text-white">
              Bubble Map
            </TabsTrigger>
            <TabsTrigger value="connections" className="text-white">
              Connections
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tracked Wallets</CardTitle>
                <CardDescription className="text-gray-400">
                  Your currently monitored wallet addresses with real data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trackedWallets.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No wallets tracked yet. Add a wallet address above to get started with real data.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trackedWallets.map((wallet) => (
                      <div
                        key={wallet.address}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{formatAddress(wallet.address)}</div>
                            <div className="text-sm text-gray-400 font-mono">{wallet.address}</div>
                            {wallet.labels && wallet.labels.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {wallet.labels.slice(0, 3).map((label, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-slate-600 text-gray-300 text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            ${wallet.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-400">
                            {wallet.balance.toFixed(4)} {wallet.platform === "Avalanche" ? "AVAX" : "ETH"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-slate-600 text-gray-300">
                              {wallet.platform}
                            </Badge>
                            <span className="text-sm text-gray-400">{wallet.connections.length} connections</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {getTimeSince(wallet.lastUpdated)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-400"
                            onClick={() => removeWallet(wallet.address)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bubble-map">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Wallet Connection Map</CardTitle>
                <CardDescription className="text-gray-400">
                  Interactive visualization of real wallet relationships and transaction flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletBubbleMap wallets={trackedWallets} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Wallet Connections</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed analysis of wallet relationships based on real transaction data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trackedWallets.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add wallets to see connection analysis</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {trackedWallets.map((wallet) => (
                      <div key={wallet.address} className="border border-slate-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-white font-medium">{formatAddress(wallet.address)}</h3>
                            <p className="text-sm text-gray-400">{wallet.connections.length} connections found</p>
                          </div>
                          <Badge variant="secondary" className="bg-slate-600 text-gray-300">
                            {wallet.platform}
                          </Badge>
                        </div>
                        {wallet.connections.length > 0 ? (
                          <div className="grid gap-2 max-h-40 overflow-y-auto">
                            {wallet.connections.slice(0, 10).map((connection, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm bg-slate-700/30 p-2 rounded"
                              >
                                <span className="font-mono text-gray-300">{formatAddress(connection)}</span>
                                <span className="text-gray-400">Connected</span>
                              </div>
                            ))}
                            {wallet.connections.length > 10 && (
                              <div className="text-center text-sm text-gray-400 py-2">
                                +{wallet.connections.length - 10} more connections
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400">
                            <p>No connections found in recent transactions</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Deep insights into wallet behavior and transaction patterns from real data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trackedWallets.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add wallets to see analytics</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {trackedWallets.map((wallet) => (
                      <div key={wallet.address} className="border border-slate-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-medium">{formatAddress(wallet.address)}</h3>
                          <Badge
                            variant="secondary"
                            className={`${
                              wallet.riskScore && wallet.riskScore > 70
                                ? "bg-red-600"
                                : wallet.riskScore && wallet.riskScore > 40
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                            } text-white`}
                          >
                            Risk: {wallet.riskScore || 0}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Transactions</div>
                            <div className="text-white text-lg">{wallet.transactions.length}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Connections</div>
                            <div className="text-white text-lg">{wallet.connections.length}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Token Types</div>
                            <div className="text-white text-lg">{wallet.tokenBalances?.length || 0}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Platform</div>
                            <div className="text-white text-lg">{wallet.platform}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
