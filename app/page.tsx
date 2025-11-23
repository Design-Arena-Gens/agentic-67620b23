'use client';

import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Reports from './components/Reports';
import AIAssistant from './components/AIAssistant';
import SavingsGoals from './components/SavingsGoals';
import { Expense, SavingsGoal } from './types';
import { Wallet, BarChart3, Target, MessageSquare, Plus, FileDown } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedGoals = localStorage.getItem('savingsGoals');

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedGoals) {
      setSavingsGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([newExpense, ...expenses]);
    setShowExpenseForm(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0,
    };
    setSavingsGoals([...savingsGoals, newGoal]);
  };

  const updateSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals(savingsGoals.map(goal =>
      goal.id === id ? { ...goal, currentAmount: goal.currentAmount + amount } : goal
    ));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FinWise AI</h1>
                <p className="text-sm text-gray-500">Smart Personal Finance Manager</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Wallet },
              { id: 'expenses', label: 'Expenses', icon: FileDown },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'goals', label: 'Savings Goals', icon: Target },
              { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard expenses={expenses} savingsGoals={savingsGoals} />
        )}
        {activeTab === 'expenses' && (
          <ExpenseList expenses={expenses} onDelete={deleteExpense} />
        )}
        {activeTab === 'reports' && <Reports expenses={expenses} />}
        {activeTab === 'goals' && (
          <SavingsGoals
            goals={savingsGoals}
            onAddGoal={addSavingsGoal}
            onUpdateGoal={updateSavingsGoal}
            onDeleteGoal={deleteSavingsGoal}
            totalIncome={expenses
              .filter(e => e.type === 'income')
              .reduce((sum, e) => sum + e.amount, 0)}
            totalExpenses={expenses
              .filter(e => e.type === 'expense')
              .reduce((sum, e) => sum + e.amount, 0)}
          />
        )}
        {activeTab === 'assistant' && (
          <AIAssistant expenses={expenses} savingsGoals={savingsGoals} />
        )}
      </main>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          onSubmit={addExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );
}
