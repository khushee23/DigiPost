import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'default',
}) => {
  const colorStyles = {
    default: {
      iconBg: 'bg-neutral-100 text-neutral-800',
      accent: 'border-neutral-200',
    },
    red: {
      iconBg: 'bg-red-50 text-[#D71920]',
      accent: 'border-neutral-200',
    },
    green: {
      iconBg: 'bg-emerald-50 text-emerald-700',
      accent: 'border-neutral-200',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-700',
      accent: 'border-neutral-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700',
      accent: 'border-neutral-200',
    },
  };

  const scheme = colorStyles[colorScheme] || colorStyles.default;

  return (
    <div className={`bg-white rounded-xl p-5 border ${scheme.accent} shadow-2xs hover:shadow-xs transition-shadow`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</h3>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-neutral-500'}`}>
                {trend.text}
              </span>
            )}
            {subtitle && <span className="text-xs text-neutral-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
