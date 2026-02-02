import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center">
        {(Array.isArray(steps) ? steps : []).map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = index === (steps?.length || 0) - 1;

          return (
            <React.Fragment key={step}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative z-10 w-40">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 
                    ${isActive 
                      ? 'border-primary bg-primary text-white' 
                      : isCompleted 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 bg-white text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                    }`}
                >
                    {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <span className="text-sm font-medium">{stepNumber}</span>
                    )}
                </div>
                <div className={`mt-2 text-xs font-medium uppercase tracking-wider ${isActive || isCompleted ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className={`flex-auto border-t-2 transition-colors duration-200 -mx-10 mb-6 ${isCompleted ? 'border-primary' : 'border-gray-300 dark:border-gray-700'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
