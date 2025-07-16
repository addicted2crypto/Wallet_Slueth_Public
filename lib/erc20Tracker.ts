// API Integration utilities for ERC20 tracking on multiple networks

export interface ERC20Transaction {
  hash: string
  from: string
  to: string
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  value: string
  decimals: number
  timestamp: number
  blockNumber: number
  network: "ethereum" | "avalanche"
}

export interface TrackedWallet {
  address: string
  label: string
  network: "ethereum" | "avalanche"
  lastCheckedBlock: number
  isActive: boolean
  createdAt: number
}

export interface Alert {
  id: string
  walletAddress: string
  transaction: ERC20Transaction
  timestamp: number
  isRead: boolean
}

// Network configurations
const NETWORK_CONFIG = {
  ethereum: {
    name: "Ethereum",
    apiUrl: "https://api.etherscan.io/api",
    explorerUrl: "https://etherscan.io",
    nativeSymbol: "ETH",
    apiKeyEnv: "ETHERSCAN_API_KEY",
    blockTime: 12,
  },
  avalanche: {
    name: "Avalanche",
    apiUrl: "https://api.snowtrace.io/api",
    explorerUrl: "https://snowtrace.io",
    nativeSymbol: "AVAX",
    apiKeyEnv: "SNOWSCAN_API_KEY",
    blockTime: 2,
  },
}

// Multi-network blockchain tracker
export class MultiNetworkTracker {
  private getApiKey(network: "ethereum" | "avalanche"): string {
    const config = NETWORK_CONFIG[network]
    const apiKey = process.env[config.apiKeyEnv]

    if (!apiKey || apiKey === "test") {
      return "YourApiKeyToken" // Fallback for free tier
    }

    return apiKey
  }

  async getLatestBlock(network: "ethereum" | "avalanche"): Promise<number> {
    try {
      const config = NETWORK_CONFIG[network]
      const apiKey = this.getApiKey(network)

      console.log(`🔍 Fetching latest block for ${network}...`)

      const response = await fetch(`${config.apiUrl}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`, {
        headers: {
          "User-Agent": "WalletTrace/1.0",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.error(`❌ HTTP ${response.status} for ${network} latest block`)
        return 0
      }

      const data = await response.json()

      if (data.result) {
        const blockNumber = Number.parseInt(data.result, 16)
        console.log(`✅ Latest block for ${network}: ${blockNumber}`)
        return blockNumber
      }

      console.error(`❌ No block number in response for ${network}:`, data)
      return 0
    } catch (error) {
      console.error(`❌ Error fetching latest block for ${network}:`, error)
      return 0
    }
  }

  async getERC20Transactions(
    address: string,
    network: "ethereum" | "avalanche",
    fromBlock = 0,
    toBlock = 999999999,
  ): Promise<ERC20Transaction[]> {
    try {
      const config = NETWORK_CONFIG[network]
      const apiKey = this.getApiKey(network)

      console.log(`🔍 Fetching ERC20 transactions for ${address} on ${config.name}`)
      console.log(`   Block range: ${fromBlock} to ${toBlock}`)
      console.log(`   API Key: ${apiKey === "YourApiKeyToken" ? "Free tier" : "Configured"}`)

      // Use a more permissive approach - check larger ranges and use pagination
      const url = `${config.apiUrl}?module=account&action=tokentx&address=${address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=desc&apikey=${apiKey}`

      console.log(`📡 API Request URL: ${url}`)

      const response = await fetch(url, {
        headers: {
          "User-Agent": "WalletTrace/1.0",
          Accept: "application/json",
        },
      })

      console.log(`📡 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        console.error(`❌ HTTP ${response.status} for ${network} token transactions`)
        const errorText = await response.text()
        console.error(`❌ Error response body:`, errorText.slice(0, 500))
        return []
      }

      const data = await response.json()

      console.log(`📊 Raw API Response for ${network}:`)
      console.log(`   Status: ${data.status}`)
      console.log(`   Message: ${data.message}`)
      console.log(`   Result type: ${Array.isArray(data.result) ? "array" : typeof data.result}`)
      console.log(`   Result count: ${Array.isArray(data.result) ? data.result.length : "N/A"}`)

      // Log the full response for debugging if it's not successful
      if (data.status !== "1") {
        console.log(`❌ Full API response:`, JSON.stringify(data, null, 2))
      }

      // Handle successful response with transactions
      if (data.status === "1" && Array.isArray(data.result) && data.result.length > 0) {
        console.log(`✅ Found ${data.result.length} total token transactions`)

        // Log sample transactions for debugging
        //Will change any in tx and i
        console.log(`📋 Sample transactions:`)
        data.result.slice(0, 3).forEach((tx: any, i: any) => {
          console.log(`   ${i + 1}. Block ${tx.blockNumber}: ${tx.tokenSymbol || "UNKNOWN"} - ${tx.hash}`)
          console.log(`      From: ${tx.from} To: ${tx.to}`)
          console.log(`      Value: ${tx.value} Decimals: ${tx.tokenDecimal}`)
          console.log(`      Time: ${new Date(Number.parseInt(tx.timeStamp) * 1000).toLocaleString()}`)
        })

        const transactions = data.result
          .filter((tx: any) => {
            // Basic validation
            return tx.hash && tx.from && tx.to && tx.contractAddress && tx.blockNumber
          })
          .map((tx: any) => ({
            hash: tx.hash,
            from: tx.from.toLowerCase(),
            to: tx.to.toLowerCase(),
            tokenAddress: tx.contractAddress.toLowerCase(),
            tokenSymbol: tx.tokenSymbol || "UNKNOWN",
            tokenName: tx.tokenName || "Unknown Token",
            value: tx.value || "0",
            decimals: Number.parseInt(tx.tokenDecimal) || 18,
            timestamp: Number.parseInt(tx.timeStamp) * 1000,
            blockNumber: Number.parseInt(tx.blockNumber),
            network: network,
          }))

        // Filter by block range if specified 
        //Will change any in tx
        const filteredTransactions = transactions.filter((tx: any) => {
          if (fromBlock > 0 && tx.blockNumber < fromBlock) return false
          if (toBlock < 999999999 && tx.blockNumber > toBlock) return false
          return true
        })

        console.log(`✅ Filtered to ${filteredTransactions.length} transactions in block range ${fromBlock}-${toBlock}`)

        return filteredTransactions
      }

      // Handle case where API returns success but no transactions
      if (data.status === "1" && Array.isArray(data.result) && data.result.length === 0) {
        console.log(`ℹ️  API returned success but no transactions found for ${address} on ${network}`)
        return []
      }

      // Handle error cases
      if (data.status === "0") {
        if (data.message === "No transactions found") {
          console.log(`ℹ️  No token transactions found for ${address} on ${network}`)
        } else if (data.message === "NOTOK") {
          console.log(`⚠️  API returned NOTOK - possibly rate limited or invalid request`)
        } else {
          console.log(`⚠️  API returned status 0: ${data.message}`)
        }
        return []
      }

      console.log(`⚠️  Unexpected API response format:`, data)
      return []
    } catch (error) {
      console.error(`❌ Error fetching ERC20 transactions for ${network}:`, error)
      return []
    }
  }

  async testApiConnection(
    network: "ethereum" | "avalanche",
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const config = NETWORK_CONFIG[network]
      const apiKey = this.getApiKey(network)

      console.log(`🧪 Testing API connection for ${network}...`)

      // Test with the specific address that has known transactions
      const testAddress = "0x1ad2dF0E33378c5c6479A92990a6c2c005Bf3B60"

      // Test token transactions endpoint directly
      const tokenResponse = await fetch(
        `${config.apiUrl}?module=account&action=tokentx&address=${testAddress}&page=1&offset=10&sort=desc&apikey=${apiKey}`,
        {
          headers: {
            "User-Agent": "WalletTrace/1.0",
            Accept: "application/json",
          },
        },
      )

      const tokenData = await tokenResponse.json()

      console.log(`🧪 Token transaction test result:`)
      console.log(`   HTTP Status: ${tokenResponse.status}`)
      console.log(`   API Status: ${tokenData.status}`)
      console.log(`   API Message: ${tokenData.message}`)
      console.log(`   Transaction Count: ${Array.isArray(tokenData.result) ? tokenData.result.length : 0}`)

      if (tokenResponse.ok && tokenData.status === "1") {
        return {
          success: true,
          message: `${config.name} API connection successful - Found ${Array.isArray(tokenData.result) ? tokenData.result.length : 0} token transactions`,
          data: {
            network,
            endpoint: config.apiUrl,
            testAddress,
            tokenTxCount: Array.isArray(tokenData.result) ? tokenData.result.length : 0,
            tokenTxStatus: tokenData.status,
            tokenTxMessage: tokenData.message,
            sampleTransaction:
              Array.isArray(tokenData.result) && tokenData.result.length > 0 ? tokenData.result[0] : null,
          },
        }
      } else {
        return {
          success: false,
          message: `${config.name} API test failed: ${tokenData.message || "Unknown error"}`,
          data: {
            response: tokenData,
            status: tokenResponse.status,
            testAddress,
          },
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `${network} API connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  getExplorerUrl(network: "ethereum" | "avalanche", txHash: string): string {
    const config = NETWORK_CONFIG[network]
    return `${config.explorerUrl}/tx/${txHash}`
  }

  getNetworkName(network: "ethereum" | "avalanche"): string {
    return NETWORK_CONFIG[network].name
  }

  getInitialBlockRange(network: "ethereum" | "avalanche"): number {
    // Use a much larger range to catch more transactions
    if (network === "ethereum") {
      return 10000 // ~1.5 days of blocks
    } else {
      return 50000 // ~1.5 days of blocks for Avalanche
    }
  }
}

// Storage class remains the same
class SimpleStorage {
  private trackedWallets: Map<string, TrackedWallet> = new Map()
  private alerts: Alert[] = []
  private readonly MAX_WALLETS = 10

  private getWalletKey(address: string, network: "ethereum" | "avalanche"): string {
    return `${network}:${address.toLowerCase()}`
  }

  addWallet(address: string, label: string, network: "ethereum" | "avalanche"): void {
    if (this.trackedWallets.size >= this.MAX_WALLETS) {
      throw new Error(`Maximum of ${this.MAX_WALLETS} wallets allowed`)
    }

    const key = this.getWalletKey(address, network)
    const wallet: TrackedWallet = {
      address: address.toLowerCase(),
      label,
      network,
      lastCheckedBlock: 0,
      isActive: true,
      createdAt: Date.now(),
    }
    this.trackedWallets.set(key, wallet)
    console.log(`✅ Added wallet: ${label} (${address}) on ${network}`)
  }

  getWallets(): TrackedWallet[] {
    return Array.from(this.trackedWallets.values())
  }

  updateWalletBlock(address: string, network: "ethereum" | "avalanche", blockNumber: number): void {
    const key = this.getWalletKey(address, network)
    const wallet = this.trackedWallets.get(key)
    if (wallet) {
      console.log(
        `📝 Updating ${wallet.label} (${network}) last checked block: ${wallet.lastCheckedBlock} -> ${blockNumber}`,
      )
      wallet.lastCheckedBlock = blockNumber
    }
  }

  addAlert(walletAddress: string, network: "ethereum" | "avalanche", transaction: ERC20Transaction): void {
    const existingAlert = this.alerts.find(
      (alert) =>
        alert.transaction.hash === transaction.hash &&
        alert.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
    )

    if (existingAlert) {
      console.log(`⚠️  Duplicate transaction detected, skipping: ${transaction.hash}`)
      return
    }

    const alert: Alert = {
      id: `${transaction.hash}-${walletAddress.toLowerCase()}-${Date.now()}`,
      walletAddress: walletAddress.toLowerCase(),
      transaction,
      timestamp: Date.now(),
      isRead: false,
    }
    this.alerts.unshift(alert)

    console.log(`🚨 Added new alert for ${walletAddress}: ${transaction.hash}`)

    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }
  }

  getAlerts(): Alert[] {
    return this.alerts
  }

  markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.isRead = true
    }
  }

  removeWallet(address: string, network: "ethereum" | "avalanche"): void {
    const key = this.getWalletKey(address, network)
    this.trackedWallets.delete(key)
    console.log(`🗑️  Removed wallet: ${address} from ${network}`)
  }

  getMaxWallets(): number {
    return this.MAX_WALLETS
  }
}

// Main tracker class remains mostly the same but with better error handling
export class ERC20Tracker {
  getSampleAddresses(network: string): any {
    throw new Error('Method not implemented.')
  }
  private tracker: MultiNetworkTracker
  private storage: SimpleStorage
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.tracker = new MultiNetworkTracker()
    this.storage = new SimpleStorage()
  }

  addWallet(address: string, label: string, network: "ethereum" | "avalanche"): void {
    if (!this.isValidAddress(address)) {
      throw new Error("Invalid address format")
    }
    this.storage.addWallet(address, label, network)
  }

  removeWallet(address: string, network: "ethereum" | "avalanche"): void {
    this.storage.removeWallet(address, network)
  }

  getWallets(): TrackedWallet[] {
    return this.storage.getWallets()
  }

  getAlerts(): Alert[] {
    return this.storage.getAlerts()
  }

  markAlertAsRead(alertId: string): void {
    this.storage.markAlertAsRead(alertId)
  }

  getExplorerUrl(network: "ethereum" | "avalanche", txHash: string): string {
    return this.tracker.getExplorerUrl(network, txHash)
  }

  getMaxWallets(): number {
    return this.storage.getMaxWallets()
  }

  async testApiConnections(): Promise<{ ethereum: any; avalanche: any }> {
    const [ethResult, avaxResult] = await Promise.all([
      this.tracker.testApiConnection("ethereum"),
      this.tracker.testApiConnection("avalanche"),
    ])

    return {
      ethereum: ethResult,
      avalanche: avaxResult,
    }
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  private formatTokenAmount(value: string, decimals: number): string {
    try {
      const amount = BigInt(value)
      const divisor = BigInt(10 ** decimals)
      const quotient = amount / divisor
      const remainder = amount % divisor

      if (remainder === BigInt(0)) {
        return quotient.toString()
      }

      const remainderStr = remainder.toString().padStart(decimals, "0")
      const trimmedRemainder = remainderStr.replace(/0+$/, "")

      if (trimmedRemainder === "") {
        return quotient.toString()
      }

      return `${quotient}.${trimmedRemainder}`
    } catch (error) {
      console.error(`Error formatting token amount: ${value} with ${decimals} decimals`, error)
      return value
    }
  }

  async checkWalletTransactions(wallet: TrackedWallet): Promise<void> {
    try {
      console.log(`\n🔍 === Checking wallet: ${wallet.label} (${wallet.network}) ===`)
      console.log(`   Address: ${wallet.address}`)
      console.log(`   Last checked block: ${wallet.lastCheckedBlock}`)

      const latestBlock = await this.tracker.getLatestBlock(wallet.network)
      if (latestBlock === 0) {
        console.error(`❌ Failed to get latest block for ${wallet.network}`)
        return
      }

      let fromBlock: number
      const toBlock: number = latestBlock

      if (wallet.lastCheckedBlock === 0) {
        // First time - check a large range to get recent history
        const initialRange = this.tracker.getInitialBlockRange(wallet.network)
        fromBlock = Math.max(0, latestBlock - initialRange)
        console.log(`🆕 First check for ${wallet.label} - checking last ${initialRange} blocks`)
        console.log(`   Block range: ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)`)
      } else {
        // Continue from where we left off
        fromBlock = wallet.lastCheckedBlock + 1
        console.log(`🔄 Continuing from block ${fromBlock}`)
        console.log(`   Block range: ${fromBlock} to ${toBlock} (${Math.max(0, toBlock - fromBlock + 1)} blocks)`)
      }

      if (fromBlock > latestBlock) {
        console.log(`ℹ️  No new blocks to check for ${wallet.label}`)
        return
      }

      const transactions = await this.tracker.getERC20Transactions(wallet.address, wallet.network, fromBlock, toBlock)

      console.log(`📊 Processing ${transactions.length} transactions for ${wallet.label}`)

      if (transactions.length > 0) {
        transactions.sort((a, b) => a.blockNumber - b.blockNumber)

        console.log(`🎯 Found ${transactions.length} new ERC20 transactions:`)

        transactions.forEach((tx, index) => {
          const amount = this.formatTokenAmount(tx.value, tx.decimals)
          const direction = tx.from === wallet.address.toLowerCase() ? "SENT" : "RECEIVED"
          const networkName = this.tracker.getNetworkName(wallet.network)

          console.log(`   ${index + 1}. Block ${tx.blockNumber}: ${direction} ${amount} ${tx.tokenSymbol}`)
          console.log(`      Hash: ${tx.hash}`)
          console.log(`      ${direction === "SENT" ? "To" : "From"}: ${direction === "SENT" ? tx.to : tx.from}`)
          console.log(`      Time: ${new Date(tx.timestamp).toLocaleString()}`)

          this.storage.addAlert(wallet.address, wallet.network, tx)

          console.log(`🚨 ALERT: ${wallet.label} ${direction} ${amount} ${tx.tokenSymbol} on ${networkName}`)
        })
      } else {
        console.log(`ℹ️  No new ERC20 transactions found for ${wallet.label}`)
      }

      this.storage.updateWalletBlock(wallet.address, wallet.network, latestBlock)
      console.log(`✅ Updated ${wallet.label} last checked block to ${latestBlock}`)
    } catch (error) {
      console.error(`❌ Error checking wallet ${wallet.address} on ${wallet.network}:`, error)
    }
  }

  async runCheck(): Promise<void> {
    const wallets = this.storage.getWallets().filter((w) => w.isActive)

    if (wallets.length === 0) {
      console.log("ℹ️  No active wallets to monitor")
      return
    }

    console.log(`\n🚀 Starting check cycle for ${wallets.length} wallets`)
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`)

    for (const wallet of wallets) {
      await this.checkWalletTransactions(wallet)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log(`✅ Check cycle completed at ${new Date().toLocaleString()}`)
    console.log(`📊 Total alerts: ${this.storage.getAlerts().length}`)
    console.log("=".repeat(80))
  }

  start(intervalMinutes = 1): void {
    if (this.isRunning) {
      console.log("⚠️  Tracker is already running")
      return
    }

    this.isRunning = true
    console.log(`🚀 Starting multi-network ERC20 tracker`)
    console.log(`⏱️  Check interval: ${intervalMinutes} minute(s)`)

    this.runCheck()

    this.intervalId = setInterval(
      () => {
        this.runCheck()
      },
      intervalMinutes * 60 * 1000,
    )
  }

  stop(): void {
    if (!this.isRunning) {
      console.log("ℹ️  Tracker is not running")
      return
    }

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log("🛑 Multi-network ERC20 tracker stopped")
  }

  isTrackerRunning(): boolean {
    return this.isRunning
  }
}

let globalTracker: ERC20Tracker | null = null

export function getTracker(): ERC20Tracker {
  if (!globalTracker) {
    globalTracker = new ERC20Tracker()
  }
  return globalTracker
}
