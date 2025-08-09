import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Card from '../components/Card/Card';
import Loading from '../components/Loading/Loading';
import Alert from '../components/Alert/Alert';
import { transactionAPI, billingAPI } from '../api';
import { formatCurrency } from '../config/currency';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Receipt,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalBills: 0,
    totalBillAmount: 0,
    recentTransactions: [],
    recentBills: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsRes, billsRes, summaryRes] = await Promise.all([
        transactionAPI.getTransactions(),
        billingAPI.getBills(),
        transactionAPI.getTransactionSummary().catch(() => ({ data: {} }))
      ]);

      const transactions = transactionsRes.data || [];
      const bills = billsRes.data || [];

      setStats({
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        totalBills: bills.length,
        totalBillAmount: bills.reduce((sum, b) => sum + parseFloat(b.total_amount ?? b.amount ?? 0), 0),
        recentTransactions: transactions.slice(0, 5),
        recentBills: bills.slice(0, 5),
        summary: summaryRes.data || {}
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Build time-series data for charts
  const { txnSeries, billSeries } = useMemo(() => {
    const toDateKey = (d) => {
      try { return new Date(d).toISOString().slice(0, 10); } catch { return null; }
    };

    const aggregate = (items, dateKey, amountKey) => {
      const map = new Map();
      (items || []).forEach((it) => {
        const key = toDateKey(it[dateKey]);
        if (!key) return;
        const amt = parseFloat(it[amountKey] ?? 0);
        map.set(key, (map.get(key) || 0) + (isNaN(amt) ? 0 : amt));
      });
      return map;
    };

    // Last 14 days
    const days = 14;
    const today = new Date();
    const range = Array.from({ length: days }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - idx));
      const key = d.toISOString().slice(0, 10);
      return { key, label: d.toLocaleDateString() };
    });

    const tMap = aggregate(stats.recentTransactions.concat(), 'date', 'amount');
    // For full accuracy, consider using all transactions; we only have recent subset here
    const bMap = aggregate(stats.recentBills.concat(), 'issued_at', 'total_amount');

    const txnSeries = range.map(r => ({ date: r.label, value: tMap.get(r.key) || 0 }));
    const billSeries = range.map(r => ({ date: r.label, value: bMap.get(r.key) || 0 }));

    return { txnSeries, billSeries };
  }, [stats.recentTransactions, stats.recentBills]);

  const colorStyles = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change }) => {
    const styles = colorStyles[color] || colorStyles.blue;
    return (
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' && (title.toLowerCase().includes('amount') || title.toLowerCase().includes('revenue') || title.toLowerCase().includes('value'))
                ? formatCurrency(value)
                : (typeof value === 'number' ? value.toLocaleString() : value)
              }
            </p>
            {change && (
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${styles.bg}`}>
            <Icon className={`h-6 w-6 ${styles.text}`} />
          </div>
        </div>
      </Card>
    );
  };

  const RecentList = ({ title, items, type }) => (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button 
          onClick={() => navigate(type === 'transactions' ? '/transactions' : '/bills')}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          View all
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent {type}</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {type === 'transactions' ? item.received_from : item.billed_to}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(item.date || item.issued_at).toLocaleDateString()}
                </p>
                {item.note && (
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.amount ?? item.total_amount ?? 0)}
                </p>
                {type === 'bills' && item.bill_number && (
                  <p className="text-xs text-gray-500">#{item.bill_number}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <Loading size="lg" text="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Overview of your accounting system</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white border text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions}
            icon={CreditCard}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalAmount}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Bills"
            value={stats.totalBills}
            icon={Receipt}
            color="purple"
          />
          <StatCard
            title="Bills Value"
            value={stats.totalBillAmount}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trend (14 days)</h3>
              <div className="text-sm text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1" />Last 14 days</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={txnSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTxn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v).replace(/[^\d.,-]/g, '')} width={70} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorTxn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bills Amount (14 days)</h3>
              <div className="text-sm text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1" />Last 14 days</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v).replace(/[^\d.,-]/g, '')} width={70} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentList
            title="Recent Transactions"
            items={stats.recentTransactions}
            type="transactions"
          />
          <RecentList
            title="Recent Bills"
            items={stats.recentBills}
            type="bills"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Add Transaction</p>
                <p className="text-sm text-gray-600">Record a new transaction</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Receipt className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Create Bill</p>
                <p className="text-sm text-gray-600">Generate a new bill</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Calendar className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600">Generate financial reports</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
