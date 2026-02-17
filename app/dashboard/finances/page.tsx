'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Plus,
  FileText,
  CreditCard,
  PieChart,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Receipt,
  ArrowUpDown,
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

interface StudentAccount {
  id: string;
  studentId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  className: string;
  curriculum: string;
  studentStatus: string;
  balance: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FinancesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [dateRange, setDateRange] = useState('all');

  // Student accounts state
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts'>('overview');
  const [initializingAccounts, setInitializingAccounts] = useState(false);

  useEffect(() => {
    fetchFinancialStats();
  }, [dateRange]);

  useEffect(() => {
    fetchStudentAccounts();
  }, [pagination.page, balanceFilter]);

  const fetchFinancialStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances/stats?range=${dateRange}`);
      const data = await response.json();
      
      // Ensure data has required structure with safe defaults
      setStats({
        totalCollected: data.totalCollected || 0,
        outstandingFees: data.outstandingFees || 0,
        thisMonthCollection: data.thisMonthCollection || 0,
        studentsWithBalance: data.studentsWithBalance || 0,
        paymentMethods: data.paymentMethods || [],
        recentTransactions: data.recentTransactions || [],
      });
    } catch (error) {
      console.error('Error fetching financial stats:', error);
      // Set safe defaults on error
      setStats({
        totalCollected: 0,
        outstandingFees: 0,
        thisMonthCollection: 0,
        studentsWithBalance: 0,
        paymentMethods: [],
        recentTransactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAccounts = useCallback(async () => {
    try {
      setAccountsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchQuery) params.append('search', searchQuery);
      if (balanceFilter) params.append('balance', balanceFilter);

      const response = await fetch(`/api/finances/accounts?${params}`);
      const data = await response.json();
      setAccounts(data.accounts || []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching student accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, balanceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchStudentAccounts();
  };

  const initializeAccounts = async () => {
    if (!confirm('This will create financial accounts for all students who don\'t have one yet. Continue?')) {
      return;
    }

    try {
      setInitializingAccounts(true);
      const response = await fetch('/api/finances/initialize-accounts', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (response.ok) {
        alert(`Success! Created ${data.created} financial accounts.`);
        fetchStudentAccounts();
        fetchFinancialStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Failed to initialize accounts: ${error.message}`);
    } finally {
      setInitializingAccounts(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Finance Management</h1>
          <p className="text-slate-600 mt-1">Track fees, payments, and student accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 font-medium bg-white hover:border-slate-400 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={initializeAccounts}
            disabled={initializingAccounts}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializingAccounts ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Initializing...
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Initialize Accounts
              </>
            )}
          </button>
          <Link
            href="/dashboard/finances/record-payment"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-slate-500 text-xs font-medium mb-1">Total Collected</h3>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalCollected)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </div>
          <h3 className="text-slate-500 text-xs font-medium mb-1">Outstanding Fees</h3>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.outstandingFees)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-slate-500 text-xs font-medium mb-1">This Month</h3>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.thisMonthCollection)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-slate-500 text-xs font-medium mb-1">Students with Balance</h3>
          <p className="text-2xl font-bold text-slate-800">{stats.studentsWithBalance}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 sm:flex-none px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('accounts');
              if (accounts.length === 0) fetchStudentAccounts();
            }}
            className={`flex-1 sm:flex-none px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'accounts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Student Accounts
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/dashboard/finances/fee-structure"
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-indigo-900 text-sm">Fee Structure</h3>
                      <p className="text-xs text-indigo-600">Set term fees</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/finances/bursaries"
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-rose-300 bg-rose-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-rose-500 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-rose-900 text-sm">Bursaries</h3>
                      <p className="text-xs text-rose-600">Apply discounts</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/finances/record-payment"
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      <Plus className="h-4 w-4 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">Record Payment</h3>
                      <p className="text-xs text-slate-500">Add payment</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/finances/record-payment?type=charge"
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <CreditCard className="h-4 w-4 text-emerald-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">Add Charge</h3>
                      <p className="text-xs text-slate-500">Single student</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/finances/bulk-charge"
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                      <Users className="h-4 w-4 text-amber-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">Bulk Charge</h3>
                      <p className="text-xs text-slate-500">Multiple students</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group text-left"
                  >
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                      <FileText className="h-4 w-4 text-purple-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">View Accounts</h3>
                      <p className="text-xs text-slate-500">All students</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setBalanceFilter('owing');
                      setActiveTab('accounts');
                      fetchStudentAccounts();
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group text-left"
                  >
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                      <AlertCircle className="h-4 w-4 text-orange-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">Owing Students</h3>
                      <p className="text-xs text-slate-500">View debtors</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-800">Payment Methods</h2>
                  <PieChart className="h-4 w-4 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {!stats.paymentMethods || stats.paymentMethods.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No payment data yet</p>
                  ) : (
                    stats.paymentMethods.map((method, index) => {
                      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                      const bgColors = ['bg-blue-50', 'bg-emerald-50', 'bg-purple-50', 'bg-orange-50', 'bg-pink-50'];
                      const color = colors[index % colors.length];
                      const bgColor = bgColors[index % bgColors.length];

                      return (
                        <div key={method.method} className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <CreditCard className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-slate-700 text-sm truncate">{method.method.replace(/_/g, ' ')}</span>
                              <span className="font-semibold text-slate-800 text-sm ml-2">{formatCurrency(method.amount)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                <div
                                  className={`${color} h-1.5 rounded-full`}
                                  style={{
                                    width: `${stats.totalCollected > 0 ? (method.amount / stats.totalCollected) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-400">{method.count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Transactions</h2>
              {!stats.recentTransactions || stats.recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No transactions recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Student</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Method</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.slice(0, 8).map((txn) => (
                        <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3">
                            <p className="font-medium text-slate-800">{txn.studentName}</p>
                            <p className="text-xs text-slate-400">{txn.studentNumber}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                txn.type === 'PAYMENT'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : txn.type === 'CHARGE'
                                    ? 'bg-orange-50 text-orange-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{txn.paymentMethod?.replace(/_/g, ' ') || '-'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-semibold ${txn.type === 'PAYMENT' ? 'text-emerald-600' : 'text-orange-600'}`}>
                              {txn.type === 'PAYMENT' ? '-' : '+'}
                              {formatCurrency(txn.amount)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{new Date(txn.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="p-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or student number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(e);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </form>
              <select
                value={balanceFilter}
                onChange={(e) => {
                  setBalanceFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">All Accounts</option>
                <option value="owing">Owing Balance</option>
                <option value="paid">Paid Up / Credit</option>
              </select>
            </div>

            {/* Accounts Table */}
            {accountsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No student accounts found</p>
                <p className="text-slate-400 text-xs mt-1">Try a different search or filter</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-3 text-xs font-medium text-slate-500 uppercase">Student</th>
                        <th className="text-left py-3 px-3 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Class</th>
                        <th className="text-left py-3 px-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Curriculum</th>
                        <th className="text-right py-3 px-3 text-xs font-medium text-slate-500 uppercase">
                          <span className="flex items-center justify-end gap-1">
                            Balance <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </th>
                        <th className="text-left py-3 px-3 text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">Last Payment</th>
                        <th className="text-center py-3 px-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-800">{account.firstName} {account.lastName}</p>
                            <p className="text-xs text-slate-400">{account.studentNumber}</p>
                          </td>
                          <td className="py-3 px-3 text-slate-600 hidden sm:table-cell">{account.className}</td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              account.curriculum === 'CAMBRIDGE'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-green-50 text-green-700'
                            }`}>
                              {account.curriculum}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`font-semibold ${
                              account.balance > 0
                                ? 'text-red-600'
                                : account.balance < 0
                                  ? 'text-emerald-600'
                                  : 'text-slate-500'
                            }`}>
                              {account.balance > 0 ? '' : account.balance < 0 ? '-' : ''}
                              {formatCurrency(account.balance)}
                            </span>
                            {account.balance > 0 && (
                              <p className="text-xs text-red-400">Owing</p>
                            )}
                            {account.balance < 0 && (
                              <p className="text-xs text-emerald-400">Credit</p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 hidden lg:table-cell">
                            {account.lastPaymentDate
                              ? new Date(account.lastPaymentDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <Link
                                href={`/dashboard/finances/student/${account.studentId}`}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                title="View Statement"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/dashboard/finances/record-payment?studentId=${account.studentId}`}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Record Payment"
                              >
                                <Receipt className="h-4 w-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} accounts
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page <= 1}
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-slate-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
