interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <div className="max-w-[540px] mx-auto rounded-sm border border-[#d06862]/50 bg-[#34191b]/92 p-3">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-[#ff9f95]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="cs2-hud-text text-lg leading-none text-[#ffd7d2]">Error</h3>
          <div className="mt-1 text-sm text-[#ffb9b1]">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 
