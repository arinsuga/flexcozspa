import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expenses | Flexcoz',
  description: 'Manage your expenses and expense sheets.',
};

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
