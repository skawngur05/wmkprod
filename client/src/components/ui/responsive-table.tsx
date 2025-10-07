import React from 'react';
import { TableWrapper } from '@/components/ui/table-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  return (
    <TableWrapper className={className}>
      <Table>
        {children}
      </Table>
    </TableWrapper>
  );
};
