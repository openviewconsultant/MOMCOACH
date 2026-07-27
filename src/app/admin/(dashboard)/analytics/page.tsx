import { createClient } from '@/lib/supabase/server';
import AnalyticsDashboard from './AnalyticsDashboard';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Fetch last 30 days of events
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1000);

  const { data: products } = await supabase
    .from('products')
    .select('id, title, category');

  return <AnalyticsDashboard events={events || []} products={products || []} />;
}
