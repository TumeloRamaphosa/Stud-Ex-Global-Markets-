'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    id: 1,
    title: 'Choose Your Hook',
    desc: 'AI analyzes your niche and generates viral hook formulas',
    figure: '🧑‍💻',
    action: 'typing on laptop',
    color: 'from-blue-500 to-cyan-500',
    detail: 'Person-conflict, Budget, Before-After, Self-discovery, POV',
  },
  {
    id: 2,
    title: 'Create 6-Slide Post',
    desc: 'AI designs a compelling carousel narrative',
    figure: '🎨',
    action: 'designing slides',
    color: 'from-purple-500 to-pink-500',
    detail: 'Hook → Problem → Discovery → Transform → Result → CTA',
  },
  {
    id: 3,
    title: 'Write Caption & CTA',
    desc: 'AI crafts platform-optimized captions',
    figure: '✍️',
    action: 'writing captions',
    color: 'from-amber-500 to-orange-500',
    detail: 'Engagement-optimized text with trending hashtags',
  },
  {
    id: 4,
    title: 'Auto-Post Everywhere',
    desc: 'Content distributed across all platforms simultaneously',
    figure: '🚀',
    action: 'launching posts',
    color: 'from-green-500 to-emerald-500',
    detail: 'TikTok, Instagram, LinkedIn, Facebook, YouTube',
  },
  {
    id: 5,
    title: 'Track & Optimize',
    desc: 'Real-time analytics with AI-powered insights',
    figure: '📊',
    action: 'analyzing data',
    color: 'from-red-500 to-rose-500',
    detail: 'Views, likes, shares, comments, conversion rates',
  },
  {
    id: 6,
    title: 'Scale & Repeat',
    desc: 'AI learns what works and scales successful patterns',
    figure: '🔄',
    action: 'scaling campaigns',
    color: 'from-indigo-500 to-violet-500',
    detail: 'Memory system stores winning formulas for future use',
  },
];

export default function AnimatedWorkflowDiagram() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="space-y-8">
      {/* Animated Flow */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 via-amber-200 via-green-200 via-red-200 to-indigo-200 -translate-y-1/2 hidden lg:block" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`relative cursor-pointer transition-all duration-500 ${
                activeStep === idx ? 'scale-110 z-10' : 'scale-100 opacity-70'
              }`}
              onClick={() => {
                setActiveStep(idx);
                setIsAnimating(false);
              }}
              onMouseEnter={() => {
                setActiveStep(idx);
                setIsAnimating(false);
              }}
              onMouseLeave={() => setIsAnimating(true)}
            >
              <div
                className={`rounded-2xl p-4 text-center bg-gradient-to-br ${step.color} text-white shadow-lg transition-all duration-500 ${
                  activeStep === idx ? 'shadow-2xl' : ''
                }`}
              >
                {/* Action Figure */}
                <div
                  className={`text-4xl mb-2 transition-transform duration-500 ${
                    activeStep === idx ? 'animate-bounce' : ''
                  }`}
                >
                  {step.figure}
                </div>

                <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Step {step.id}
                </div>
                <div className="text-sm font-bold mt-1">{step.title}</div>
              </div>

              {/* Arrow connector (hidden on small screens) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                  <div
                    className={`text-lg transition-all duration-300 ${
                      activeStep === idx ? 'text-white animate-pulse' : 'text-slate-300'
                    }`}
                  >
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Step Detail */}
      <div
        className={`bg-gradient-to-br ${steps[activeStep].color} rounded-2xl p-6 text-white shadow-xl transition-all duration-500`}
      >
        <div className="flex items-start gap-6">
          {/* Animated Figure */}
          <div className="text-6xl animate-bounce flex-shrink-0">
            {steps[activeStep].figure}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                Step {steps[activeStep].id}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                {steps[activeStep].action}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{steps[activeStep].title}</h3>
            <p className="text-white/90 mb-3">{steps[activeStep].desc}</p>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm font-medium">{steps[activeStep].detail}</p>
            </div>
          </div>

          {/* Mini animated scene */}
          <div className="hidden md:flex flex-col items-center gap-2 text-4xl">
            <div className="animate-pulse">💡</div>
            <div className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>⚙️</div>
            <div className="animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === idx ? 'bg-white scale-125' : 'bg-white/40'
              }`}
              onClick={() => {
                setActiveStep(idx);
                setIsAnimating(false);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
