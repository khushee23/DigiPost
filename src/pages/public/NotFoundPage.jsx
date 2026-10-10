import React from 'react';
import { Link } from 'react-router-dom';
import { PackageX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200 shadow-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
          <PackageX className="w-8 h-8 text-[#D71920]" />
        </div>
        <span className="text-4xl font-extrabold text-[#111111] font-mono block">404</span>
        <h1 className="text-xl font-bold text-neutral-900 mt-1">Destination Not Found</h1>
        <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
          The postal page or resource route you requested does not exist or has been relocated to another distribution point.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" icon={Home} className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="sm" icon={ArrowLeft} className="w-full sm:w-auto">
              Go Back
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
};
