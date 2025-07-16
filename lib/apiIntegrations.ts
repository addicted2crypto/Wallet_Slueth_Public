// API Integration utilities for blockchain analytics platforms

export interface WalletData {
  address: string
  balance: number
  balanceUSD: number
  transactions: Transaction[]
  connections: string[]
  labels?: string[]
  riskScore?: number
  platform: string
  tokenBalances?: TokenBalance[]
  lastUpdated: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: number
  valueUSD: number
  timestamp: number
  blockNumber: number
  gasUsed?: number
  gasPrice?: number
}

export interface TokenBalance {
  token: string
  symbol: string
  balance: number
  balanceUSD: number
  decimals: number
}

export interface ClusterData {
  id: string
  wallets: string[]
  totalValue: number
  riskLevel: "low" | "medium" | "high"
  tags: string[]
  connections: WalletConnection[]
}

export interface WalletConnection {
  from: string
  to: string
  transactionCount: number
  totalValue: number
  strength: number
}

export interface APIResponse {
  success: boolean
  data?: any
  error?: string
  source: string
}

// Snowscan API Integration (Avalanche) - REAL API
export class SnowscanAPI {
  private baseUrl = "https://api.snowscan.xyz/api"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getAccountBalance(address: string): Promise<APIResponse> {
    try {
      if (!this.apiKey || this.apiKey === "test") {
        return {
          success: false,
          error: "Test mode - no real API key",
          source: "snowscan",
        }
      }

      console.log(`Fetching balance for ${address} from Snowscan...`)

      const response = await fetch(
        `${this.baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`,
        {
          headers: {
            "User-Agent": "WalletTrace/1.0",
          },
        },
      )

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          source: "snowscan",
        }
      }

      const data = await response.json()
      console.log("Snowscan balance response:", data)

      if (data.status === "1") {
        const balanceWei = BigInt(data.result)
        const balanceAVAX = Number(balanceWei) / Math.pow(10, 18)

        // Get AVAX price
        const avaxPrice = await this.getAVAXPrice()
        const balanceUSD = balanceAVAX * avaxPrice

        return {
          success: true,
          data: {
            balance: balanceAVAX,
            balanceUSD: balanceUSD,
          },
          source: "snowscan",
        }
      }

      return {
        success: false,
        error: data.message || "Unknown error from Snowscan",
        source: "snowscan",
      }
    } catch (error) {
      console.error("Snowscan API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        source: "snowscan",
      }
    }
  }

  async getTransactionHistory(address: string, limit = 100): Promise<APIResponse> {
    try {
      if (!this.apiKey || this.apiKey === "test") {
        return {
          success: false,
          error: "Test mode - no real API key",
          source: "snowscan",
        }
      }

      console.log(`Fetching transactions for ${address} from Snowscan...`)

      const response = await fetch(
        `${this.baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.apiKey}`,
        {
          headers: {
            "User-Agent": "WalletTrace/1.0",
          },
        },
      )

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          source: "snowscan",
        }
      }

      const data = await response.json()
      console.log(`Snowscan transactions response: ${data.result?.length || 0} transactions`)

      if (data.status === "1" && Array.isArray(data.result)) {
        const transactions = data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from.toLowerCase(),
          to: tx.to.toLowerCase(),
          value: Number(BigInt(tx.value)) / Math.pow(10, 18),
          valueUSD: 0, // Would need historical price data
          timestamp: Number(tx.timeStamp) * 1000,
          blockNumber: Number(tx.blockNumber),
          gasUsed: Number(tx.gasUsed),
          gasPrice: Number(tx.gasPrice),
        }))

        return {
          success: true,
          data: transactions,
          source: "snowscan",
        }
      }

      return {
        success: false,
        error: data.message || "No transactions found",
        source: "snowscan",
      }
    } catch (error) {
      console.error("Snowscan transaction history error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        source: "snowscan",
      }
    }
  }

  private async getAVAXPrice(): Promise<number> {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd")
      if (!response.ok) return 30 // Fallback price

      const data = await response.json()
      const price = data["avalanche-2"]?.usd || 30
      console.log(`AVAX price: $${price}`)
      return price
    } catch (error) {
      console.error("Error fetching AVAX price:", error)
      return 30 // Fallback price
    }
  }
}

// Etherscan API Integration (Ethereum) - REAL API
export class EtherscanAPI {
  private baseUrl = "https://api.etherscan.io/api"
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || "YourApiKeyToken" // Free tier available
  }

  async getAccountBalance(address: string): Promise<APIResponse> {
    try {
      console.log(`Fetching ETH balance for ${address} from Etherscan...`)

      const response = await fetch(
        `${this.baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`,
      )

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          source: "etherscan",
        }
      }

      const data = await response.json()
      console.log("Etherscan balance response:", data)

      if (data.status === "1") {
        const balanceWei = BigInt(data.result)
        const balanceETH = Number(balanceWei) / Math.pow(10, 18)

        // Get ETH price
        const ethPrice = await this.getETHPrice()
        const balanceUSD = balanceETH * ethPrice

        return {
          success: true,
          data: {
            balance: balanceETH,
            balanceUSD: balanceUSD,
          },
          source: "etherscan",
        }
      }

      return {
        success: false,
        error: data.message || "Unknown error from Etherscan",
        source: "etherscan",
      }
    } catch (error) {
      console.error("Etherscan API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        source: "etherscan",
      }
    }
  }

  private async getETHPrice(): Promise<number> {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      if (!response.ok) return 2000 // Fallback price

      const data = await response.json()
      const price = data.ethereum?.usd || 2000
      console.log(`ETH price: $${price}`)
      return price
    } catch (error) {
      console.error("Error fetching ETH price:", error)
      return 2000 // Fallback price
    }
  }
}

// DeBank API Integration - FREE PUBLIC API
export class DeBankAPI {
  private baseUrl = "https://openapi.debank.com/v1"

  async getPortfolio(address: string): Promise<APIResponse> {
    try {
      console.log(`Fetching portfolio for ${address} from DeBank...`)

      const response = await fetch(`${this.baseUrl}/user/total_balance?id=${address}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "WalletTrace/1.0",
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          source: "debank",
        }
      }

      const data = await response.json()
      console.log("DeBank portfolio response:", data)

      return {
        success: true,
        data: {
          totalUsdValue: data.total_usd_value || 0,
          chainList: data.chain_list || [],
        },
        source: "debank",
      }
    } catch (error) {
      console.error("DeBank API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        source: "debank",
      }
    }
  }

  async getTokenBalances(address: string): Promise<APIResponse> {
    try {
      console.log(`Fetching token balances for ${address} from DeBank...`)

      const response = await fetch(`${this.baseUrl}/user/token_list?id=${address}&is_all=false`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "WalletTrace/1.0",
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          source: "debank",
        }
      }

      const data = await response.json()
      console.log(`DeBank tokens response: ${data?.length || 0} tokens`)

      if (Array.isArray(data)) {
        const tokens = data.map((token: any) => ({
          token: token.id,
          symbol: token.optimized_symbol || token.symbol,
          balance: token.amount,
          balanceUSD: token.amount * (token.price || 0),
          decimals: token.decimals,
        }))

        return {
          success: true,
          data: tokens,
          source: "debank",
        }
      }

      return {
        success: false,
        error: "Invalid response format",
        source: "debank",
      }
    } catch (error) {
      console.error("DeBank token balances error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        source: "debank",
      }
    }
  }
}

// Connection Analysis from Transaction Data
export class ConnectionAnalyzer {
  static analyzeTransactions(address: string, transactions: Transaction[]): WalletConnection[] {
    const connectionMap = new Map<string, { count: number; totalValue: number; timestamps: number[] }>()

    transactions.forEach((tx) => {
      const counterparty = tx.from === address.toLowerCase() ? tx.to : tx.from
      if (counterparty && counterparty !== address.toLowerCase()) {
        const existing = connectionMap.get(counterparty) || { count: 0, totalValue: 0, timestamps: [] }
        connectionMap.set(counterparty, {
          count: existing.count + 1,
          totalValue: existing.totalValue + tx.value,
          timestamps: [...existing.timestamps, tx.timestamp],
        })
      }
    })

    // Convert to WalletConnection format and calculate strength
    return Array.from(connectionMap.entries())
      .map(([addr, data]) => {
        // Calculate strength based on transaction count, value, and recency
        const countScore = Math.min(data.count / 20, 1) // Normalize by 20 transactions
        const valueScore = Math.min(data.totalValue / 100, 1) // Normalize by 100 ETH/AVAX
        const recentTimestamp = Math.max(...data.timestamps)
        const daysSinceLastTx = (Date.now() - recentTimestamp) / (1000 * 60 * 60 * 24)
        const recencyScore = Math.max(0, 1 - daysSinceLastTx / 365) // Decay over a year

        const strength = countScore * 0.4 + valueScore * 0.4 + recencyScore * 0.2

        return {
          from: address,
          to: addr,
          transactionCount: data.count,
          totalValue: data.totalValue,
          strength: Math.min(strength, 1),
        }
      })
      .filter((conn) => conn.strength > 0.1) // Filter out weak connections
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 50) // Top 50 connections
  }
}

// Unified API Manager
export class WalletTrackingAPI {
  discoverWalletCluster(address: any, arg1: any) {
    throw new Error('Method not implemented.')
  }
  private snowscan: SnowscanAPI
  private etherscan: EtherscanAPI
  private debank: DeBankAPI

  constructor() {
    this.snowscan = new SnowscanAPI(process.env.SNOWSCAN_API_KEY || "")
    this.etherscan = new EtherscanAPI(process.env.ETHERSCAN_API_KEY)
    this.debank = new DeBankAPI()
  }

  async getComprehensiveWalletData(address: string): Promise<WalletData> {
    const startTime = Date.now()
    console.log(`\n=== Fetching comprehensive data for ${address} ===`)

    try {
      // Determine which blockchain to use based on address or user preference
      // For now, we'll try both Avalanche and Ethereum
      const [snowscanBalance, snowscanTxs, ethBalance, debankPortfolio, debankTokens] = await Promise.allSettled([
        this.snowscan.getAccountBalance(address),
        this.snowscan.getTransactionHistory(address),
        this.etherscan.getAccountBalance(address),
        this.debank.getPortfolio(address),
        this.debank.getTokenBalances(address),
      ])

      console.log("\n=== API Results ===")
      console.log(
        "Snowscan Balance:",
        snowscanBalance.status === "fulfilled" ? snowscanBalance.value.success : "failed",
      )
      console.log("Snowscan Transactions:", snowscanTxs.status === "fulfilled" ? snowscanTxs.value.success : "failed")
      console.log("Etherscan Balance:", ethBalance.status === "fulfilled" ? ethBalance.value.success : "failed")
      console.log(
        "DeBank Portfolio:",
        debankPortfolio.status === "fulfilled" ? debankPortfolio.value.success : "failed",
      )
      console.log("DeBank Tokens:", debankTokens.status === "fulfilled" ? debankTokens.value.success : "failed")

      // Extract successful results
      let balance = 0
      let balanceUSD = 0
      let platform = "Unknown"
      let transactions: Transaction[] = []

      // Try Snowscan first (Avalanche)
      if (snowscanBalance.status === "fulfilled" && snowscanBalance.value.success) {
        balance = snowscanBalance.value.data.balance
        balanceUSD = snowscanBalance.value.data.balanceUSD
        platform = "Avalanche"
      }
      // Fallback to Etherscan (Ethereum)
      else if (ethBalance.status === "fulfilled" && ethBalance.value.success) {
        balance = ethBalance.value.data.balance
        balanceUSD = ethBalance.value.data.balanceUSD
        platform = "Ethereum"
      }

      // Get transactions from successful source
      if (snowscanTxs.status === "fulfilled" && snowscanTxs.value.success) {
        transactions = snowscanTxs.value.data
      }

      // Get DeBank data if available
      let debankValue = 0
      let tokenBalances: TokenBalance[] = []

      if (debankPortfolio.status === "fulfilled" && debankPortfolio.value.success) {
        debankValue = debankPortfolio.value.data.totalUsdValue
        balanceUSD = Math.max(balanceUSD, debankValue) // Use higher value
      }

      if (debankTokens.status === "fulfilled" && debankTokens.value.success) {
        tokenBalances = debankTokens.value.data
      }

      // Analyze connections from transaction data
      const connections = ConnectionAnalyzer.analyzeTransactions(address, transactions)

      const result: WalletData = {
        address: address.toLowerCase(),
        balance,
        balanceUSD,
        transactions,
        connections: connections.map((c) => c.to),
        labels: this.generateLabelsFromData(balanceUSD, transactions.length, connections.length),
        riskScore: this.calculateRiskScore(transactions, connections),
        platform,
        tokenBalances,
        lastUpdated: Date.now(),
      }

      const endTime = Date.now()
      console.log(`\n=== Summary for ${address} ===`)
      console.log(`Platform: ${platform}`)
      console.log(`Balance: ${balance.toFixed(4)} ${platform === "Avalanche" ? "AVAX" : "ETH"}`)
      console.log(`USD Value: $${balanceUSD.toLocaleString()}`)
      console.log(`Transactions: ${transactions.length}`)
      console.log(`Connections: ${connections.length}`)
      console.log(`Token Balances: ${tokenBalances.length}`)
      console.log(`Processing Time: ${endTime - startTime}ms`)
      console.log("=".repeat(50))

      return result
    } catch (error) {
      console.error("Error in getComprehensiveWalletData:", error)
      throw error
    }
  }

  private generateLabelsFromData(balanceUSD: number, txCount: number, connectionCount: number): string[] {
    const labels: string[] = []

    if (balanceUSD > 1000000) labels.push("Whale")
    else if (balanceUSD > 100000) labels.push("High Value")
    else if (balanceUSD > 10000) labels.push("Medium Value")

    if (txCount > 1000) labels.push("High Activity")
    else if (txCount > 100) labels.push("Active")

    if (connectionCount > 50) labels.push("Hub")
    else if (connectionCount > 20) labels.push("Well Connected")

    return labels
  }

  private calculateRiskScore(transactions: Transaction[], connections: WalletConnection[]): number {
    let score = 0

    // High transaction volume increases risk
    if (transactions.length > 1000) score += 30
    else if (transactions.length > 100) score += 15

    // Many connections can indicate mixing or complex activity
    if (connections.length > 100) score += 40
    else if (connections.length > 50) score += 20

    // Recent high-value transactions
    const recentHighValue = transactions
      .filter((tx) => Date.now() - tx.timestamp < 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .filter((tx) => tx.value > 10) // > 10 ETH/AVAX

    if (recentHighValue.length > 10) score += 30

    return Math.min(score, 100)
  }

  async getWalletConnections(address: string): Promise<WalletConnection[]> {
    try {
      const txResponse = await this.snowscan.getTransactionHistory(address)
      if (txResponse.success) {
        return ConnectionAnalyzer.analyzeTransactions(address, txResponse.data)
      }
      return []
    } catch (error) {
      console.error("Error getting wallet connections:", error)
      return []
    }
  }
}
