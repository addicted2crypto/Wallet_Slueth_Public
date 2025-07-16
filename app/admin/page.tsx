"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Users,
  Database,
  Activity,
  AlertTriangle,
  Settings,
  LogOut,
  Search,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [users] = useState([
    {
      id: 1,
      email: "demo@wallettrace.com",
      wallets: 5,
      lastActive: "2024-01-20",
      status: "active",
    },
    {
      id: 2,
      email: "analyst@wallettrace.com",
      wallets: 12,
      lastActive: "2024-01-19",
      status: "active",
    },
    {
      id: 3,
      email: "trader@example.com",
      wallets: 8,
      lastActive: "2024-01-18",
      status: "inactive",
    },
  ]);

  const [systemStats] = useState({
    totalUsers: 156,
    totalWallets: 2847,
    totalConnections: 15632,
    apiCalls: 45231,
    activeUsers: 89,
    systemHealth: "healthy",
  });

  const [recentActivity] = useState([
    {
      id: 1,
      user: "demo@wallettrace.com",
      action: "Added wallet",
      details: "0x742d35...4C4C",
      time: "2 min ago",
    },
    {
      id: 2,
      user: "analyst@wallettrace.com",
      action: "Created cluster",
      details: "Trading Group",
      time: "5 min ago",
    },
    {
      id: 3,
      user: "trader@example.com",
      action: "API call",
      details: "MetaSleuth integration",
      time: "8 min ago",
    },
    {
      id: 4,
      user: "demo@wallettrace.com",
      action: "Exported data",
      details: "Wallet connections",
      time: "12 min ago",
    },
  ]);

  return (
    <div className='min-h-screen bg-slate-900'>
      {/* Admin Header */}
      <header className='border-b border-red-700 bg-slate-800/50'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/' className='text-2xl font-bold text-white'>
              WalletTrace
            </Link>
            <Badge variant='destructive' className='bg-red-600'>
              <Shield className='h-3 w-3 mr-1' />
              ADMIN - TEST MODE
            </Badge>
          </div>
          <div className='flex items-center gap-4'>
            <Link href='/dashboard'>
              <Button
                variant='ghost'
                size='sm'
                className='text-gray-400 hover:text-white'
              >
                User View
              </Button>
            </Link>
            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:text-white'
            >
              <Settings className='h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:text-white'
            >
              <LogOut className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        {/* System Stats */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-400'>
                Total Users
              </CardTitle>
              <Users className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {systemStats.totalUsers}
              </div>
              <p className='text-xs text-blue-400'>
                {systemStats.activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-400'>
                Tracked Wallets
              </CardTitle>
              <Database className='h-4 w-4 text-green-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {systemStats.totalWallets.toLocaleString()}
              </div>
              <p className='text-xs text-green-400'>
                {systemStats.totalConnections.toLocaleString()} connections
              </p>
            </CardContent>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-400'>
                API Calls
              </CardTitle>
              <Activity className='h-4 w-4 text-purple-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {systemStats.apiCalls.toLocaleString()}
              </div>
              <p className='text-xs text-purple-400'>Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-400'>
                System Health
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-green-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white capitalize'>
                {systemStats.systemHealth}
              </div>
              <p className='text-xs text-green-400'>All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue='users' className='space-y-6'>
          <TabsList className='bg-slate-800 border-slate-700'>
            <TabsTrigger value='users' className='text-white'>
              Users
            </TabsTrigger>
            <TabsTrigger value='activity' className='text-white'>
              Activity
            </TabsTrigger>
            <TabsTrigger value='system' className='text-white'>
              System
            </TabsTrigger>
            <TabsTrigger value='api' className='text-white'>
              API Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value='users'>
            <Card className='bg-slate-800/50 border-slate-700'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-white'>
                      User Management
                    </CardTitle>
                    <CardDescription className='text-gray-400'>
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='bg-slate-700 border-slate-600 text-white'
                    >
                      <Download className='h-4 w-4 mr-2' />
                      Export
                    </Button>
                    <div className='relative'>
                      <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='Search users...'
                        className='pl-10 bg-slate-700 border-slate-600 text-white w-64'
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className='border-slate-700'>
                      <TableHead className='text-gray-400'>Email</TableHead>
                      <TableHead className='text-gray-400'>Wallets</TableHead>
                      <TableHead className='text-gray-400'>
                        Last Active
                      </TableHead>
                      <TableHead className='text-gray-400'>Status</TableHead>
                      <TableHead className='text-gray-400'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className='border-slate-700'>
                        <TableCell className='text-white'>
                          {user.email}
                        </TableCell>
                        <TableCell className='text-white'>
                          {user.wallets}
                        </TableCell>
                        <TableCell className='text-white'>
                          {user.lastActive}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                            className={
                              user.status === "active"
                                ? "bg-green-600"
                                : "bg-gray-600"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-gray-400 hover:text-white'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-gray-400 hover:text-red-400'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='activity'>
            <Card className='bg-slate-800/50 border-slate-700'>
              <CardHeader>
                <CardTitle className='text-white'>Recent Activity</CardTitle>
                <CardDescription className='text-gray-400'>
                  Real-time system activity and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                        <div>
                          <div className='text-white font-medium'>
                            {activity.user}
                          </div>
                          <div className='text-sm text-gray-400'>
                            {activity.action}: {activity.details}
                          </div>
                        </div>
                      </div>
                      <div className='text-sm text-gray-400'>
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='system'>
            <div className='grid gap-6'>
              <Card className='bg-slate-800/50 border-slate-700'>
                <CardHeader>
                  <CardTitle className='text-white'>
                    System Configuration
                  </CardTitle>
                  <CardDescription className='text-gray-400'>
                    Manage system settings and configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                      <div>
                        <div className='text-white font-medium'>
                          API Rate Limiting
                        </div>
                        <div className='text-sm text-gray-400'>
                          Current: 1000 requests/hour per user
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-slate-700 border-slate-600 text-white'
                      >
                        Configure
                      </Button>
                    </div>
                    <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                      <div>
                        <div className='text-white font-medium'>
                          Database Maintenance
                        </div>
                        <div className='text-sm text-gray-400'>
                          Last cleanup: 2 hours ago
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-slate-700 border-slate-600 text-white'
                      >
                        Run Now
                      </Button>
                    </div>
                    <div className='flex items-center justify-between p-4 bg-slate-700/50 rounded-lg'>
                      <div>
                        <div className='text-white font-medium'>
                          Backup Status
                        </div>
                        <div className='text-sm text-gray-400'>
                          Last backup: 6 hours ago
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-slate-700 border-slate-600 text-white'
                      >
                        Backup Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='api'>
            <Card className='bg-slate-800/50 border-slate-700'>
              <CardHeader>
                <CardTitle className='text-white'>
                  API Integration Monitor
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Monitor external API performance and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div className='p-4 bg-slate-700/50 rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-white font-medium'>
                          MetaSleuth API
                        </span>
                        <Badge className='bg-green-600'>Online</Badge>
                      </div>
                      <div className='text-sm text-gray-400'>
                        Response time: 245ms
                      </div>
                      <div className='text-sm text-gray-400'>
                        Calls today: 1,234
                      </div>
                    </div>
                    <div className='p-4 bg-slate-700/50 rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-white font-medium'>
                          Arkham API
                        </span>
                        <Badge className='bg-green-600'>Online</Badge>
                      </div>
                      <div className='text-sm text-gray-400'>
                        Response time: 189ms
                      </div>
                      <div className='text-sm text-gray-400'>
                        Calls today: 856
                      </div>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='p-4 bg-slate-700/50 rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-white font-medium'>
                          DeBank API
                        </span>
                        <Badge className='bg-green-600'>Online</Badge>
                      </div>
                      <div className='text-sm text-gray-400'>
                        Response time: 312ms
                      </div>
                      <div className='text-sm text-gray-400'>
                        Calls today: 2,145
                      </div>
                    </div>
                    <div className='p-4 bg-slate-700/50 rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-white font-medium'>
                          Snowscan API
                        </span>
                        <Badge className='bg-green-600'>Online</Badge>
                      </div>
                      <div className='text-sm text-gray-400'>
                        Response time: 156ms
                      </div>
                      <div className='text-sm text-gray-400'>
                        Calls today: 567
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
