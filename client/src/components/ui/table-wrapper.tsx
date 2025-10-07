import React from 'react';

interface TableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`table-responsive-wrapper ${className}`}>
      {children}
    </div>
  );
};
