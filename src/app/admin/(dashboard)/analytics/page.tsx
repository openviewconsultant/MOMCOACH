import { createClient } from '@/lib/supabase/server';
import AnalyticsDashboard from './AnalyticsDashboard';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Fetch last 90 days so client-side filters have full range
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', ninetyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5000);

  const { data: products } = await supabase
    .from('products')
    .select('id, title, category');

  return <AnalyticsDashboard events={events || []} products={products || []} />;
}
