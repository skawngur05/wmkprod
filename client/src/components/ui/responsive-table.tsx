import { TableWrapper } from '@/components/ui/table-wrapper';
import { Table } from '@/components/ui/table';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto">
      <TableWrapper className={className}>
        <Table className="min-w-full">
          {children}
        </Table>
      </TableWrapper>
    </div>
  );
};
