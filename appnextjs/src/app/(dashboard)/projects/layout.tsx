import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Flexcoz',
  description: 'Track and manage your projects.',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
