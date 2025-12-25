import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track - Trackr',
  description: 'Track your daily habits and build better routines with priority-based scoring',
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
