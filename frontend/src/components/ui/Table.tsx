import React from 'react';

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-notion-border rounded-xl bg-notion-bg">
      <table className="min-w-full divide-y divide-notion-border">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-notion-warmBg">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-notion-border bg-notion-bg">{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-black/[0.02] transition-colors">{children}</tr>;
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <th
      scope="col"
      className={`py-3 pl-4 pr-3 text-left text-sm font-medium text-notion-textSecondary sm:pl-6 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`whitespace-nowrap py-3.5 pl-4 pr-3 text-sm text-notion-text sm:pl-6 ${className}`} {...props}>
      {children}
    </td>
  );
}
