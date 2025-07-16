"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { WalletData } from "@/lib/api-integrations"

interface WalletNode {
  id: string
  address: string
  label: string
  value: number
  connections: number
  x: number
  y: number
  radius: number
  color: string
}

interface WalletBubbleMapProps {
  wallets: WalletData[]
}

export default function WalletBubbleMap({ wallets }: WalletBubbleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Convert wallet data to nodes
  const walletNodes: WalletNode[] = wallets.map((wallet, index) => {
    const angle = (index / wallets.length) * 2 * Math.PI
    const radius = Math.min(200 + index * 50, 300)
    const centerX = 400
    const centerY = 300

    return {
      id: wallet.address,
      address: wallet.address,
      label: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
      value: wallet.balanceUSD,
      connections: wallet.connections.length,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      radius: Math.max(20, Math.min(80, wallet.balanceUSD / 10000)), // Scale radius based on value
      color: getWalletColor(wallet.balanceUSD),
    }
  })

  // Generate connections based on actual wallet connections
  const connections = wallets.flatMap((wallet) =>
    wallet.connections
      .slice(0, 5)
      .map((connectedAddress) => {
        const targetWallet = wallets.find((w) => w.address.toLowerCase() === connectedAddress.toLowerCase())
        if (targetWallet) {
          return {
            from: wallet.address,
            to: targetWallet.address,
            strength: 0.7, // Could be calculated based on transaction volume
          }
        }
        return null
      })
      .filter(Boolean),
  )

  function getWalletColor(value: number): string {
    if (value > 100000) return "#EF4444" // Red for high value
    if (value > 50000) return "#F59E0B" // Orange for medium-high
    if (value > 10000) return "#10B981" // Green for medium
    if (value > 1000) return "#06B6D4" // Cyan for low-medium
    return "#8B5CF6" // Purple for low value
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply zoom and pan
      ctx.save()
      ctx.scale(zoom, zoom)
      ctx.translate(pan.x, pan.y)

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = walletNodes.find((n) => n.id === conn.from)
        const toNode = walletNodes.find((n) => n.id === conn.to)

        if (fromNode && toNode) {
          ctx.beginPath()
          ctx.moveTo(fromNode.x, fromNode.y)
          ctx.lineTo(toNode.x, toNode.y)
          ctx.strokeStyle = `rgba(148, 163, 184, ${conn.strength * 0.5})`
          ctx.lineWidth = conn.strength * 3
          ctx.stroke()
        }
      })

      // Draw wallet nodes
      walletNodes.forEach((node) => {
        // Draw node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)
        ctx.fillStyle = node.color
        ctx.fill()

        // Draw border
        ctx.strokeStyle = selectedNode?.id === node.id ? "#FFFFFF" : "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1
        ctx.stroke()

        // Draw label
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "12px Inter"
        ctx.textAlign = "center"
        ctx.fillText(node.label, node.x, node.y - node.radius - 10)

        // Draw value
        ctx.font = "10px Inter"
        ctx.fillText(`$${(node.value / 1000).toFixed(1)}K`, node.x, node.y + 5)
      })

      ctx.restore()
    }

    draw()
  }, [selectedNode, zoom, pan, walletNodes, connections])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - pan.x * zoom) / zoom
    const y = (event.clientY - rect.top - pan.y * zoom) / zoom

    // Check if click is on a node
    const clickedNode = walletNodes.find((node) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= node.radius
    })

    setSelectedNode(clickedNode || null)
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
  }

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔗</span>
        </div>
        <p>Add wallets to see connection visualization</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="bg-slate-700 border-slate-600 text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="bg-slate-700 border-slate-600 text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="bg-slate-700 border-slate-600 text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {selectedNode && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-600 text-white">
              Selected: {selectedNode.label}
            </Badge>
            <span className="text-sm text-gray-400">
              ${selectedNode.value.toLocaleString()} • {selectedNode.connections} connections
            </span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
        <canvas ref={canvasRef} width={800} height={500} onClick={handleCanvasClick} className="cursor-pointer" />

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-slate-800/90 rounded-lg p-3 space-y-2">
          <div className="text-sm font-medium text-white">Value Legend</div>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>$100K+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>$50K-$100K</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>$10K-$50K</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span>$1K-$10K</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Under $1K</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 bg-slate-800/90 rounded-lg p-3">
          <div className="text-xs text-gray-300">Click on bubbles to select • Use controls to zoom</div>
        </div>
      </div>
    </div>
  )
}
