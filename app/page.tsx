"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Shield,
  Network,
  Eye,
  Key,
  Save,
  Bell,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkAdminMode = async () => {
      try {
        const response = await fetch("/api/admin/check");
        const data = await response.json();
        setIsAdminMode(data.adminMode);
        setCurrentApiKey(data.currentKey || "");
      } catch (error) {
        console.error("Failed to check admin mode:", error);
      }
    };
    checkAdminMode();
  }, []);

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newApiKey }),
      });

      if (response.ok) {
        setCurrentApiKey(newApiKey);
        setIsAdminMode(newApiKey === "test");
        setIsConfigOpen(false);
        // Refresh the page to apply changes
        window.location.reload();
      } else {
        console.error("Failed to update API key");
      }
    } catch (error) {
      console.error("Error updating API key:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getApiKeyDisplay = () => {
    if (!currentApiKey) return "Not set";
    if (currentApiKey === "test") return "Test Mode";
    return `${currentApiKey.slice(0, 8)}...${currentApiKey.slice(-4)}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      <div className='container mx-auto px-4 py-16'>
        {/* API Configuration Button */}
        <div className='fixed top-4 left-4 z-50'>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='bg-slate-800 border-slate-600 text-white hover:bg-slate-700'
              >
                <Key className='h-4 w-4 mr-2' />
                API Config
              </Button>
            </DialogTrigger>
            <DialogContent className='bg-slate-800 border-slate-700'>
              <DialogHeader>
                <DialogTitle className='text-white'>
                  API Configuration
                </DialogTitle>
                <DialogDescription className='text-gray-400'>
                  Configure your Snowscan API key. Use "test" for admin mode or
                  enter your real API key.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label className='text-white'>Current API Key</Label>
                  <div className='mt-1 p-2 bg-slate-700 rounded text-gray-300 text-sm'>
                    {getApiKeyDisplay()}
                  </div>
                </div>
                <div>
                  <Label htmlFor='new-api-key' className='text-white'>
                    New API Key
                  </Label>
                  <Input
                    id='new-api-key'
                    type='password'
                    placeholder="Enter API key or 'test' for admin mode"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className='bg-slate-700 border-slate-600 text-white mt-1'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleSaveApiKey}
                    disabled={!newApiKey.trim() || isSaving}
                    className='bg-purple-600 hover:bg-purple-700'
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className='h-4 w-4 mr-2' />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setNewApiKey("test")}
                    className='bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                  >
                    Set Test Mode
                  </Button>
                </div>
                <div className='text-xs text-gray-400'>
                  <p>• Use "test" to enable admin mode for testing</p>
                  <p>• Enter your real Snowscan API key for live data</p>
                  <p>• Changes require a page refresh to take effect</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Admin Quick Access */}
        {isAdminMode && (
          <div className='fixed top-4 right-4 z-50'>
            <Link href='/admin'>
              <Button
                variant='destructive'
                size='sm'
                className='bg-red-600 hover:bg-red-700'
              >
                <Shield className='h-4 w-4 mr-2' />
                Admin Access
              </Button>
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-white mb-6'>
            Wills ERC20 Tracker
            {isAdminMode && (
              <span className='text-red-400 text-lg ml-4'>[TEST MODE]</span>
            )}
            {currentApiKey && currentApiKey !== "test" && (
              <span className='text-green-400 text-lg ml-4'>[LIVE DATA]</span>
            )}
          </h1>
          <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
            Track up to 10 wallet addresses across Ethereum and Avalanche
            networks. Get instant alerts for ERC20 token transactions with our
            simple, automated monitoring system.
          </p>
          <div className='flex gap-4 justify-center'>
            <Link href='/tracker'>
              <Button size='lg' className='bg-purple-600 hover:bg-purple-700'>
                <Bell className='mr-2 h-4 w-4' />
                Start Tracking <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
            {isAdminMode ? (
              <>
                <Link href='/admin'>
                  <Button size='lg' className='bg-red-600 hover:bg-red-700'>
                    <Shield className='mr-2 h-4 w-4' />
                    Admin Dashboard
                  </Button>
                </Link>
                <Link href='/auth'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-transparent'
                  >
                    User Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link href='/auth'>
                <Button
                  size='lg'
                  variant='outline'
                  className='border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-transparent'
                >
                  Advanced Tracking
                </Button>
              </Link>
            )}
          </div>

          {/* API Status Indicator */}
          <div className='mt-6 flex justify-center'>
            <div className='bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700'>
              <div className='flex items-center gap-2 text-sm'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentApiKey ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className='text-gray-300'>
                  API Status:{" "}
                  {currentApiKey
                    ? currentApiKey === "test"
                      ? "Test Mode"
                      : "Live Data"
                    : "Not Configured"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <Bell className='h-8 w-8 text-purple-400 mb-2' />
              <CardTitle className='text-white'>Real-time Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-gray-400'>
                Get instant notifications when tracked wallets make ERC20 token
                transactions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <Zap className='h-8 w-8 text-yellow-400 mb-2' />
              <CardTitle className='text-white'>Track 10 Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-gray-400'>
                Monitor up to 10 wallet addresses simultaneously across Ethereum
                and Avalanche networks
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <Eye className='h-8 w-8 text-blue-400 mb-2' />
              <CardTitle className='text-white'>Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-gray-400'>
                Built-in address masking for screenshots and privacy protection
                with show/hide toggle
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader>
              <Network className='h-8 w-8 text-green-400 mb-2' />
              <CardTitle className='text-white'>Multi-Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-gray-400'>
                Support for both Ethereum and Avalanche networks using reliable
                API endpoints
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-8'>Quick Start</h2>
          <div className='grid md:grid-cols-3 gap-6 max-w-4xl '>
            <div className='bg-slate-800/50 p-6 rounded-lg border border-slate-700'>
              <div className='text-3xl mb-4'>1️⃣</div>
              <h3 className='text-white font-semibold mb-2'>Add Wallets</h3>
              <p className='text-gray-400 text-sm'>
                Enter up to 10 Ethereum or Avalanche addresses you want to
                monitor for ERC20 transactions
              </p>
            </div>
            <div className='bg-slate-800/50 p-6 rounded-lg border border-slate-700'>
              <div className='text-3xl mb-4'>2️⃣</div>
              <h3 className='text-white font-semibold mb-2'>Start Tracking</h3>
              <p className='text-gray-400 text-sm'>
                Click start and the system will check for new transactions every
                minute across both networks
              </p>
            </div>
            <div className='bg-slate-800/50 p-6 rounded-lg border border-slate-700'>
              <div className='text-3xl mb-4'>3️⃣</div>
              <h3 className='text-white font-semibold mb-2'>Get Alerts</h3>
              <p className='text-gray-400 text-sm'>
                Receive instant notifications when any tracked wallet moves
                ERC20 tokens with privacy protection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
