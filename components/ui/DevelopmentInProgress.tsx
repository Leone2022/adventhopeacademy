'use client';

import { Construction, ArrowLeft, Clock, Wrench } from 'lucide-react';
import Link from 'next/link';

interface DevelopmentInProgressProps {
  title?: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  features?: string[];
}

export default function DevelopmentInProgress({
  title = 'Development In Progress',
  description = 'This feature is currently under development and will be available soon.',
  backLink = '/dashboard',
  backLabel = 'Back to Dashboard',
  features = [],
}: DevelopmentInProgressProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Construction className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <Wrench className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{title}</h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">{description}</p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-6">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>

          {/* Planned Features */}
          {features.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Planned Features:</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Development Progress</span>
              <span>In Progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full animate-pulse"
                style={{ width: '35%' }}
              ></div>
            </div>
          </div>

          {/* Back Button */}
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          {/* Contact Info */}
          <p className="mt-6 text-xs text-gray-400">
            Need this feature urgently? Contact the development team.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center mt-4 gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
