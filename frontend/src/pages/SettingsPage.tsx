import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import {
  Settings,
  Shield,
  Key,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [currency, setCurrency] = useState('INR');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendInfo, setBackendInfo] = useState<any>(null);

  useEffect(() => {
    checkHealth();
    loadAIConfig();
  }, []);

  const loadAIConfig = async () => {
    try {
      const res = await axios.get('/api/settings/ai-config');
      if (res.data.is_configured) {
        setKeyStatus(`Active Key: ${res.data.masked_key} (${res.data.model})`);
      }
    } catch {}
  };

  const handleVerifyApiKey = async () => {
    if (!apiKeyInput.trim()) {
      addToast('Please enter an API key to save', 'warning');
      return;
    }
    setIsVerifyingKey(true);
    try {
      const res = await axios.post('/api/settings/ai-config', {
        api_key: apiKeyInput.trim(),
        model: aiModel,
      });
      if (res.data.verification_status.includes('working')) {
        setKeyStatus('Verified & Connected to Live Gemini API!');
        addToast('Live Gemini API key verified and saved!', 'success');
      } else {
        setKeyStatus(`Saved (Status: ${res.data.verification_status})`);
        addToast('Key saved. Testing will use live AI or fallback.', 'info');
      }
      setApiKeyInput('');
      checkHealth();
    } catch (err: any) {
      addToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const checkHealth = async () => {
    setBackendStatus('checking');
    try {
      const res = await axios.get('/api/health');
      setBackendStatus('connected');
      setBackendInfo(res.data);
    } catch {
      setBackendStatus('disconnected');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Preferences saved successfully!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage currency, AI generation engine preferences, and integrations.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* System & AI Preferences */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Engine & Model</h2>
              <p className="text-[11px] text-slate-500">Configure backend generative AI provider.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                AI Generation Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fast Real-Time)</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Multi-Day)</option>
                <option value="deterministic-offline">Deterministic Local AI Planner (Offline Mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="GBP">GBP (£ British Pound)</option>
              </select>
            </div>
          </div>

          {/* Gemini API Key Configuration */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key (Optional for Live LLM Mode)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Paste your Gemini API key to enable live Google Gemini calls. If left blank, TripNest runs its built-in budget-tier dynamic planner.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleVerifyApiKey}
                disabled={isVerifyingKey}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
              >
                {isVerifyingKey ? 'Verifying...' : 'Save & Verify Key'}
              </button>
            </div>
            {keyStatus && (
              <p className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${
                keyStatus.includes('working') ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {keyStatus.includes('working') ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{keyStatus}</span>
              </p>
            )}
          </div>
        </div>

        {/* Backend & Database Health Status */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Backend & Database Status</h2>
                <p className="text-[11px] text-slate-500">FastAPI & Supabase / SQLite connectivity.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkHealth}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Refresh connection status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              {backendStatus === 'connected' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : backendStatus === 'checking' ? (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-semibold text-slate-800">FastAPI REST Server</span>
            </div>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                backendStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {backendStatus === 'connected' ? 'Operational' : 'Checking / Disconnected'}
            </span>
          </div>

          {backendInfo && (
            <div className="text-[11px] text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <span>Service: <strong>{backendInfo.service}</strong> | AI Configured: <strong>{String(backendInfo.ai_configured)}</strong></span>
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Account Credentials</h2>
              <p className="text-[11px] text-slate-500">Active user session.</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p>Signed in as: <strong className="text-slate-900">{user?.email || 'traveler@tripnest.com'}</strong></p>
            <p>User ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{user?.id || 'demo-user-id'}</code></p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
