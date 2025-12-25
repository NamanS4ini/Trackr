import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Trackr',
  description: 'Visualize your habit tracking progress with charts, graphs, and activity heatmaps',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
