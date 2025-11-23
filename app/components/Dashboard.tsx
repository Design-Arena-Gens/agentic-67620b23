'use client';

import { Expense, SavingsGoal } from '../types';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
}

export default function Dashboard({ expenses, savingsGoals }: DashboardProps) {
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyExpenses = expenses.filter(
    e => e.type === 'expense' && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  );

  const monthlyIncome = expenses.filter(
    e => e.type === 'income' && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  );

  const totalIncome = monthlyIncome.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalGoalsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Income</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Net Savings</p>
              <p className={`text-3xl font-bold mt-2 ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${netSavings.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Savings Goals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {savingsGoals.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totalGoalsTarget > 0 ? `${((totalGoalsCurrent / totalGoalsTarget) * 100).toFixed(0)}% complete` : 'No goals set'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <PiggyBank className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {expenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-500">{expense.category} • {format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                </div>
                <span className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-gray-500 py-8">No transactions yet. Add your first expense!</p>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            Top Spending Categories
          </h2>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className="text-sm text-gray-600">${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <p className="text-center text-gray-500 py-8">No expense data for this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">💡 Quick Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Daily Average Spending</p>
            <p className="text-2xl font-bold mt-1">
              ${(totalExpenses / new Date().getDate()).toFixed(2)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Largest Expense</p>
            <p className="text-2xl font-bold mt-1">
              ${monthlyExpenses.length > 0 ? Math.max(...monthlyExpenses.map(e => e.amount)).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Transactions This Month</p>
            <p className="text-2xl font-bold mt-1">
              {expenses.filter(e => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
