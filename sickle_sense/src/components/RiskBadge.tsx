interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge = ({ level, score, size = 'md' }: RiskBadgeProps) => {
  const levelStyles = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const displayText = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full font-semibold ${levelStyles[level]} ${sizeStyles[size]}`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      {displayText[level]}
      {score !== undefined && <span className="font-bold">({score}/100)</span>}
    </div>
  );
};
