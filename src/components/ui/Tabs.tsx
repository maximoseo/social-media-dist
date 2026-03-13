'use client';

import { useRef, useState, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  hasContent?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFadeRight, setShowFadeRight] = useState(false);
  const [showFadeLeft, setShowFadeLeft] = useState(false);

  const checkOverflow = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    setShowFadeLeft(el.scrollLeft > 2);
  };

  useEffect(() => {
    checkOverflow();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow, { passive: true });
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      {showFadeLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface/80 to-transparent z-10 pointer-events-none" />
      )}
      <div
        ref={containerRef}
        className="flex border-b border-border overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-body-sm font-medium whitespace-nowrap transition-colors relative min-h-tap sm:min-h-0 ${
              activeTab === tab.id
                ? 'text-accent bg-surface-raised/50'
                : 'text-tab-inactive hover:text-text-primary hover:bg-surface-raised/30'
            }`}
          >
            {tab.label}
            {tab.hasContent && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-success inline-block" />
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>
      {showFadeRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface/80 to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}
