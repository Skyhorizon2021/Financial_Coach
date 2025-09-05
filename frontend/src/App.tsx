import React, { useState, useEffect, useCallback } from 'react';
import {LineChart,Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,BarChart,Bar} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Target, DollarSign, Calendar, Coffee, CreditCard, Brain, Eye, Upload, Activity, Sparkles,Menu,X,ChevronDown,Filter} from 'lucide-react';

// Types
interface SpendingInsight {
  category: string;
  total_spent: number;
  percentage_of_total: number;
  trend: 'increasing' | 'decreasing';
}

interface Subscription {
  merchant: string;
  amount: number;
  frequency: string;
  last_transaction: string;
  confidence_score: number;
  category: string;
}

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  goal_type: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  merchant?: string;
}

interface SpendingData {
  name: string;
  value: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  spending: number;
}

type ActiveView = 'dashboard' | 'insights' | 'goals';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsight[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('month');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSampleData();
      
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const sampleTransactions: Transaction[] = [
      { id: '1', amount: 156.78, description: 'Multiple Coffee Purchases', category: 'food', type: 'expense', date: '2024-08-15', merchant: 'Starbucks' },
      { id: '2', amount: 12.99, description: 'Netflix Subscription', category: 'subscription', type: 'expense', date: '2024-08-01', merchant: 'Netflix' },
      { id: '3', amount: 2500.00, description: 'Freelance Payment', category: 'freelance', type: 'income', date: '2024-08-01' },
    ];
    
    setTransactions(sampleTransactions);
    
    setSpendingInsights([
      { category: 'Food & Dining', total_spent: 1250.50, percentage_of_total: 32.5, trend: 'increasing' },
      { category: 'Shopping', total_spent: 890.23, percentage_of_total: 23.1, trend: 'decreasing' },
      { category: 'Transportation', total_spent: 560.78, percentage_of_total: 14.6, trend: 'increasing' },
      { category: 'Entertainment', total_spent: 430.45, percentage_of_total: 11.2, trend: 'decreasing' },
      { category: 'Bills & Utilities', total_spent: 720.15, percentage_of_total: 18.7, trend: 'increasing' }
    ]);
    
    setSubscriptions([
      { merchant: 'Netflix', amount: 15.99, frequency: 'monthly', last_transaction: '2024-01-15', confidence_score: 0.95, category: 'subscription' },
      { merchant: 'Spotify', amount: 9.99, frequency: 'monthly', last_transaction: '2024-01-12', confidence_score: 0.92, category: 'subscription' },
      { merchant: 'Adobe Creative', amount: 52.99, frequency: 'monthly', last_transaction: '2024-01-08', confidence_score: 0.88, category: 'subscription' },
      { merchant: 'Gym Membership', amount: 39.99, frequency: 'monthly', last_transaction: '2024-01-01', confidence_score: 0.91, category: 'subscription' }
    ]);
    
    setGoals([
      { id: '1', title: 'Emergency Fund', target_amount: 10000, current_amount: 2400, target_date: '2024-12-31', goal_type: 'savings' },
      { id: '2', title: 'Vacation to Japan', target_amount: 3000, current_amount: 800, target_date: '2024-10-15', goal_type: 'savings' }
    ]);
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading and processing file...');
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadStatus('File uploaded successfully!');
      await loadInitialData();
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      setUploadStatus('Upload failed. Please try again.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const COLORS: string[] = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  const coffeeSpending = transactions
    .filter(t => t.merchant === 'Starbucks')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  const spendingData: SpendingData[] = spendingInsights.map(insight => ({
    name: insight.category,
    value: insight.total_spent,
    percentage: insight.percentage_of_total
  }));

  const monthlyTrend: MonthlyTrend[] = [
    { month: 'Jan', spending: 3200, income: 4500 },
    { month: 'Feb', spending: 3400, income: 4500 },
    { month: 'Mar', spending: 3600, income: 4500 },
    { month: 'Apr', spending: 3300, income: 4500 },
    { month: 'May', spending: 3500, income: 4500 },
    { month: 'Jun', spending: 3800, income: 4500 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-600">Loading your financial insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Financial Coach
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden lg:block">AI-Powered Financial Intelligence</p>
              </div>
            </div>
            
            {/* Desktop Navigation & Upload */}
            <div className="hidden lg:flex items-center space-x-4">
              <label className="relative cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 sm:px-4 rounded-full text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Upload className="h-4 w-4 inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Upload Data</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.xlsx,.xls" />
              </label>
              
              <nav className="flex space-x-1 sm:space-x-2">
                {[
                  { key: 'dashboard', label: 'Dashboard', icon: Activity },
                  { key: 'insights', label: 'Insights', icon: Eye },
                  { key: 'goals', label: 'Goals', icon: Target }
                ].map(({ key, label, icon: Icon }) => (
                  <button 
                    key={key}
                    onClick={() => setActiveView(key as ActiveView)}
                    className={`px-3 py-2 sm:px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                      activeView === key 
                        ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 pt-4 pb-4">
              <div className="space-y-3">
                <label className="flex items-center justify-center cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Financial Data
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.xlsx,.xls" />
                </label>
                
                <nav className="grid grid-cols-1 gap-2">
                  {[
                    { key: 'dashboard', label: 'Dashboard', icon: Activity },
                    { key: 'insights', label: 'AI Insights', icon: Eye },
                    { key: 'goals', label: 'Goal Tracking', icon: Target }
                  ].map(({ key, label, icon: Icon }) => (
                    <button 
                      key={key}
                      onClick={() => {
                        setActiveView(key as ActiveView);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                        activeView === key 
                          ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Status Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`border rounded-xl p-4 ${
            uploadStatus.includes('successful') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : uploadStatus.includes('failed') 
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm sm:text-base">{uploadStatus}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {/* Filter Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Overview</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {selectedTimeframe === 'month' ? 'This Month' : selectedTimeframe === 'quarter' ? 'This Quarter' : 'This Year'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
                        {[
                          { key: 'month', label: 'This Month' },
                          { key: 'quarter', label: 'This Quarter' },
                          { key: 'year', label: 'This Year' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedTimeframe(key);
                              setIsFilterOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Coffee Insight */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full">
                    <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
                    AI INSIGHT
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Coffee Spending Alert</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  You've spent <span className="font-bold text-orange-600 text-lg">${coffeeSpending.toFixed(2)}</span> on coffee this month.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-orange-800 font-medium">
                    💡 Brewing at home could save you over $1,200 a year!
                  </p>
                </div>
              </div>

              {/* Subscription Detector */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
                    DETECTED
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Subscription Monitor</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  Found <span className="font-bold text-purple-600 text-lg">{subscriptions.length}</span> recurring subscriptions
                </p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-purple-800 font-medium">
                    💰 Total monthly cost: ${totalSubscriptions.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Goal Progress */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 md:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
                    ON TRACK
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Goal Progress</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  Emergency Fund: <span className="font-bold text-green-600 text-lg">24%</span> complete
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {/* Spending Breakdown */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Spending Breakdown</h3>
                <div className="h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingData}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percentage}) => `${name}: ${percentage.toFixed(1)}%`}
                        labelLine={false}
                      >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Income vs Spending Trend</h3>
                <div className="h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        formatter={(value) => `$${value}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={3} name="Spending" dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Insights View */}
        {activeView === 'insights' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered Insights
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Discover hidden patterns in your spending</p>
              </div>
            </div>

            {/* Spending Insights */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Spending Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {spendingInsights.map((insight, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">{insight.category}</h4>
                      {insight.trend === 'increasing' ? 
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" /> : 
                        <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      }
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      ${insight.total_spent.toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">{insight.percentage_of_total.toFixed(1)}% of total spending</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Detector */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Subscription & Recurring Charges</h3>
              <div className="space-y-4">
                {subscriptions.map((subscription, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">{subscription.merchant}</h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-2">
                        {subscription.frequency} • Last charged: {subscription.last_transaction}
                      </p>
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 sm:px-3 rounded-full">
                        {Math.round(subscription.confidence_score * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-4 sm:space-x-0 sm:space-y-2">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">${subscription.amount}</p>
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <p className="text-sm sm:text-base text-yellow-900 font-medium">
                  💡 <strong>AI Recommendation:</strong> You could save $42.99/month by reviewing your Adobe and Gym subscriptions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Goals View */}
        {activeView === 'goals' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Goal Forecasting
                </h2>
                <p className="text-sm sm:text-base text-gray-600">AI-powered predictions for your financial goals</p>
              </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {goals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const remaining = goal.target_amount - goal.current_amount;
                const monthsRemaining = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
                const monthlyTarget = remaining / Math.max(monthsRemaining, 1);
                
                return (
                  <div key={goal.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{goal.title}</h3>
                      <span className="px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-green-100 text-green-800 self-start">
                        {progress > 50 ? 'On Track' : 'Needs Attention'}
                      </span>
                    </div>
                    
                    <div className="mb-4 sm:mb-6">
                      <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-3">
                        <span className="font-medium">${goal.current_amount.toFixed(2)} saved</span>
                        <span className="font-medium">${goal.target_amount.toFixed(2)} target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
                        {progress.toFixed(1)}% complete • ${remaining.toFixed(2)} remaining
                      </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center text-sm sm:text-base text-gray-700">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="font-medium">Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center text-sm sm:text-base text-gray-700">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="font-medium">Need: ${monthlyTarget.toFixed(2)}/month</span>
                      </div>

                      <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center text-sm sm:text-base">
                          <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                          AI Recommendations:
                        </h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-2">
                          <li>• Save ${monthlyTarget.toFixed(2)} per month to reach your goal</li>
                          <li>• Consider reducing coffee spending by 50%</li>
                          <li>• Review subscription services for potential savings</li>
                          {progress < 30 && <li>• Set up automatic transfers to boost savings</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Goal Creation CTA */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-center text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Set New Goals?</h3>
              <p className="text-sm sm:text-base mb-6 opacity-90">Let our AI help you create personalized financial goals based on your spending patterns.</p>
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Create New Goal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 z-40">
        <nav className="flex justify-around">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: Activity },
            { key: 'insights', label: 'Insights', icon: Eye },
            { key: 'goals', label: 'Goals', icon: Target }
          ].map(({ key, label, icon: Icon }) => (
            <button 
              key={key}
              onClick={() => setActiveView(key as ActiveView)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeView === key 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;