import React from 'react';
import { Sparkles, Route, Building2, RefreshCw, Wallet, CheckCircle } from 'lucide-react';

export const WhyChooseSection: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Personalized Plans',
      desc: 'Generates realistic daily schedules tailored to your travel style, pace, and interests rather than canned tourist traps.',
    },
    {
      icon: Route,
      title: 'Optimized Routes & Time',
      desc: 'Geographically groups nearby attractions to minimize transit fatigue and prevent rushed travel days.',
    },
    {
      icon: Building2,
      title: 'Curated Stays & Dining',
      desc: 'Recommends hotels and verified local culinary spots aligned with your dietary habits and budget tier.',
    },
    {
      icon: RefreshCw,
      title: 'Regenerate Any Day or Stop',
      desc: 'Freely swap activities with alternative options or regenerate an entire single day while locking your favorites.',
    },
    {
      icon: Wallet,
      title: 'Real Budget Optimization',
      desc: 'Granular cost breakdowns across accommodation, meals, transit, and entry passes calculated in INR.',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Why Choose TripNest</h2>
        <p className="text-xs text-slate-500 mt-1">
          Built for travelers who want freedom, structure, and zero decision fatigue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {features.map((feat, idx) => (
          <div key={idx} className="flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <feat.icon className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1.5">{feat.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
