'use client';

import React from 'react';

/**
 * LoadingSpinner component
 * Displays a loading spinner with support for full-page and inline variants
 * 
 * @param {Object} props
 * @param {string} props.variant - 'fullPage' or 'inline' (default: 'inline')
 * @param {string} props.size - 'small', 'medium', or 'large' (default: 'medium')
 * @param {string} props.message - Optional loading message to display
 */
export default function LoadingSpinner({ 
  variant = 'inline', 
  size = 'medium',
  message = '' 
}) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  if (variant === 'fullPage') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
}
