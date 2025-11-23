'use client';

import { Expense } from '../types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { TrendingUp, PieChart as PieChartIcon, Calendar } from 'lucide-react';

interface ReportsProps {
  expenses: Expense[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Reports({ expenses }: ReportsProps) {
  // Monthly trend data (last 6 months)
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const monthlyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthExpenses = expenses.filter(
      e => e.type === 'expense' && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
    );

    const monthIncome = expenses.filter(
      e => e.type === 'income' && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
    );

    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = monthIncome.reduce((sum, e) => sum + e.amount, 0);

    return {
      month: format(month, 'MMM'),
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalIncome - totalExpenses,
    };
  });

  // Category breakdown (current month)
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthExpenses = expenses.filter(
    e => e.type === 'expense' && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  );

  const categoryData = Object.entries(
    currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Weekly spending trend
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayExpenses = expenses.filter(
      e => e.type === 'expense' && format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      day: format(date, 'EEE'),
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold opacity-90">Total Income</h3>
            <TrendingUp className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold opacity-90">Total Expenses</h3>
            <PieChartIcon className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">All time</p>
        </div>

        <div className={`bg-gradient-to-br ${netSavings >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} rounded-xl shadow-md p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold opacity-90">Net Savings</h3>
            <Calendar className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-3xl font-bold">${netSavings.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">All time</p>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">6-Month Financial Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown & Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Spending by Category ({format(currentMonth, 'MMMM')})
          </h2>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">${cat.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-12">No expense data for this month</p>
          )}
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Last 7 Days Spending</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" name="Spending" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly Average:</span>
              <span className="font-bold text-gray-900">
                ${(weeklyData.reduce((sum, d) => sum + d.amount, 0) / 7).toFixed(2)}/day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Comparison */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
