'use client';

import { useState } from 'react';
import { Expense, SavingsGoal } from '../types';
import { Send, Bot, User, Sparkles, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

interface AIAssistantProps {
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant({ expenses, savingsGoals }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI financial assistant. I can help you analyze your spending patterns, suggest ways to save money, and give personalized financial advice. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Calculate financial metrics
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryTotals = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];

    // Spending analysis
    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      if (totalExpenses === 0) {
        return "You haven't logged any expenses yet. Start tracking your spending to get personalized insights!";
      }
      return `Based on your spending data:\n\n💰 Total expenses: $${totalExpenses.toFixed(2)}\n📊 Top category: ${topCategory?.[0] || 'N/A'} ($${(topCategory?.[1] || 0).toFixed(2)})\n📉 You're spending ${savingsRate >= 0 ? 'within' : 'beyond'} your income.\n\n${savingsRate < 20 ? '⚠️ Try to save at least 20% of your income. Consider reducing discretionary spending.' : '✅ Great job maintaining a healthy savings rate!'}`;
    }

    // Savings advice
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      const recommendations = [];

      if (savingsRate < 20) {
        recommendations.push('• Aim to save at least 20% of your income');
      }
      if (categoryTotals['Food & Dining'] > totalIncome * 0.15) {
        recommendations.push('• Your food spending is high - try meal prepping to save 30-40%');
      }
      if (categoryTotals['Entertainment'] > totalIncome * 0.1) {
        recommendations.push('• Consider free entertainment alternatives to reduce costs');
      }
      if (categoryTotals['Shopping'] > totalIncome * 0.1) {
        recommendations.push('• Use the 24-hour rule before making non-essential purchases');
      }

      if (recommendations.length === 0) {
        return "You're doing great with your savings! Keep maintaining your current habits and consider increasing your savings rate gradually.";
      }

      return `Here are personalized savings tips for you:\n\n${recommendations.join('\n')}\n\nImplementing these could save you $${(totalExpenses * 0.15).toFixed(2)}/month!`;
    }

    // Budget advice
    if (lowerMessage.includes('budget')) {
      const recommendedBudget = {
        'Housing': totalIncome * 0.30,
        'Food & Dining': totalIncome * 0.15,
        'Transportation': totalIncome * 0.15,
        'Savings': totalIncome * 0.20,
        'Entertainment': totalIncome * 0.05,
        'Other': totalIncome * 0.15,
      };

      return `Recommended budget breakdown (50/30/20 rule):\n\n${Object.entries(recommendedBudget)
        .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)} (${((amount / totalIncome) * 100).toFixed(0)}%)`)
        .join('\n')}\n\nAdjust based on your lifestyle and location!`;
    }

    // Goals advice
    if (lowerMessage.includes('goal')) {
      if (savingsGoals.length === 0) {
        return "You haven't set any savings goals yet. I recommend starting with:\n\n1. Emergency Fund (3-6 months expenses)\n2. Short-term goals (vacation, gadgets)\n3. Long-term goals (home, retirement)\n\nStart with one achievable goal to build momentum!";
      }

      const totalGoalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
      const totalGoalCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
      const progress = (totalGoalCurrent / totalGoalTarget) * 100;

      return `Your savings goals progress: ${progress.toFixed(1)}%\n\n${savingsGoals.map(g => {
        const gProgress = (g.currentAmount / g.targetAmount) * 100;
        const remaining = g.targetAmount - g.currentAmount;
        return `📌 ${g.name}: ${gProgress.toFixed(0)}% ($${remaining.toFixed(2)} remaining)`;
      }).join('\n')}\n\n${netSavings > 0 ? `With your current savings rate, allocate $${(netSavings * 0.8).toFixed(2)}/month to goals!` : 'Focus on increasing income or reducing expenses to fund your goals.'}`;
    }

    // Income advice
    if (lowerMessage.includes('income')) {
      return `Your total income: $${totalIncome.toFixed(2)}\n\nWays to increase income:\n\n• Ask for a raise (research market rates)\n• Start a side hustle aligned with your skills\n• Freelance in your spare time\n• Invest in upskilling for better opportunities\n• Sell unused items\n\nEven an extra $500/month can make a huge difference!`;
    }

    // General overview
    if (lowerMessage.includes('overview') || lowerMessage.includes('summary')) {
      return `📊 Financial Overview:\n\n💵 Income: $${totalIncome.toFixed(2)}\n💸 Expenses: $${totalExpenses.toFixed(2)}\n💰 Net Savings: $${netSavings.toFixed(2)}\n📈 Savings Rate: ${savingsRate.toFixed(1)}%\n🎯 Active Goals: ${savingsGoals.length}\n\n${savingsRate >= 20 ? '✅ You\'re on track!' : '⚠️ Try to increase your savings rate to 20%'}\n\nAsk me about specific areas like spending, savings, or budget advice!`;
    }

    // Default response
    return "I can help you with:\n\n• Analyzing your spending patterns\n• Savings tips and strategies\n• Budget recommendations\n• Savings goal advice\n• Income optimization ideas\n\nTry asking: 'How can I save more?' or 'Analyze my spending'";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  const quickActions = [
    { label: 'Analyze my spending', icon: TrendingUp },
    { label: 'How can I save more?', icon: Lightbulb },
    { label: 'Review my budget', icon: AlertCircle },
    { label: 'Financial overview', icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Financial Assistant</h2>
              <p className="text-sm opacity-90">Powered by advanced AI</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.role === 'user'
                      ? 'bg-blue-500'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-6 py-3 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(action.label);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors text-left"
                >
                  <action.icon className="w-4 h-4 text-blue-500" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your finances..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
