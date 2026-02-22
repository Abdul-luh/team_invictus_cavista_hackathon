interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({ children, className = '', onClick, hover = false }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${hover ? 'hover:shadow-lg cursor-pointer transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
