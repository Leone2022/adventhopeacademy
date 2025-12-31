'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Plus,
  FileText,
  Download,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';

interface FinancialStats {
  totalCollected: number;
  outstandingFees: number;
  thisMonthCollection: number;
  studentsWithBalance: number;
  paymentMethods: { method: string; amount: number; count: number }[];
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  studentName: string;
  studentNumber: string;
  type: string;
  amount: number;
  date: string;
  paymentMethod?: string;
}

export default function FinancesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchFinancialStats();
  }, [dateRange]);

  const fetchFinancialStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances/stats?range=${dateRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching financial stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Finance Management</h1>
          <p className="text-slate-600 mt-1">Track fees, payments, and financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 font-medium bg-white hover:border-slate-400"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Collected */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-100" />
          </div>
          <h3 className="text-emerald-100 text-sm font-medium mb-1">Total Collected</h3>
          <p className="text-3xl font-bold">${stats.totalCollected.toLocaleString()}</p>
        </div>

        {/* Outstanding Fees */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <TrendingDown className="h-5 w-5 text-orange-100" />
          </div>
          <h3 className="text-orange-100 text-sm font-medium mb-1">Outstanding Fees</h3>
          <p className="text-3xl font-bold">${stats.outstandingFees.toLocaleString()}</p>
        </div>

        {/* This Month's Collection */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-100" />
          </div>
          <h3 className="text-blue-100 text-sm font-medium mb-1">This Month</h3>
          <p className="text-3xl font-bold">${stats.thisMonthCollection.toLocaleString()}</p>
        </div>

        {/* Students with Balance */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-purple-100 text-sm font-medium mb-1">Students with Balance</h3>
          <p className="text-3xl font-bold">{stats.studentsWithBalance}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/finances/payments/new"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Plus className="h-5 w-5 text-blue-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Record Payment</h3>
              <p className="text-xs text-slate-500">Add new payment</p>
            </div>
          </Link>

          <Link
            href="/dashboard/finances/bulk-charge"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <CreditCard className="h-5 w-5 text-emerald-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Bulk Fee Charge</h3>
              <p className="text-xs text-slate-500">Charge multiple students</p>
            </div>
          </Link>

          <Link
            href="/dashboard/finances/reports"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <FileText className="h-5 w-5 text-purple-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Financial Reports</h3>
              <p className="text-xs text-slate-500">Generate reports</p>
            </div>
          </Link>

          <Link
            href="/dashboard/finances/adjustments"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <BarChart3 className="h-5 w-5 text-orange-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Adjustments</h3>
              <p className="text-xs text-slate-500">Manual debit/credit</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Payment Methods</h2>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {stats.paymentMethods.map((method, index) => {
              const colors = [
                'bg-blue-500',
                'bg-emerald-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-pink-500',
              ];
              const bgColors = [
                'bg-blue-50',
                'bg-emerald-50',
                'bg-purple-50',
                'bg-orange-50',
                'bg-pink-50',
              ];
              const color = colors[index % colors.length];
              const bgColor = bgColors[index % bgColors.length];

              return (
                <div key={method.method} className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
                    <CreditCard className={`h-5 w-5 text-${color.replace('bg-', '')}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{method.method.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-800">${method.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{
                            width: `${(method.amount / stats.totalCollected) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{method.count} txns</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
            <Link href="/dashboard/finances/transactions" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentTransactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    txn.type === 'PAYMENT' ? 'bg-emerald-100' : 'bg-orange-100'
                  }`}>
                    {txn.type === 'PAYMENT' ? (
                      <TrendingDown className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{txn.studentName}</p>
                    <p className="text-xs text-slate-500">{txn.studentNumber} • {new Date(txn.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${txn.type === 'PAYMENT' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {txn.type === 'PAYMENT' ? '-' : '+'}${txn.amount.toFixed(2)}
                  </p>
                  {txn.paymentMethod && (
                    <p className="text-xs text-slate-500">{txn.paymentMethod}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
