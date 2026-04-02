export function ScrollArea({ children, className = "" }) {
  return (
    <div className={`max-h-64 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
