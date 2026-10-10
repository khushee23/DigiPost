import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  badge = null,
  actions = null,
  breadcrumbs = null,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && (
        <nav className="flex text-xs text-neutral-400 mb-2 font-medium" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-neutral-300">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-neutral-700 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-neutral-600">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
