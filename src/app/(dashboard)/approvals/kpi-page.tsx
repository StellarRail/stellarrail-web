'use client'
import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('@/components/analytics/TimeToPayment'), {
  ssr: false,
  loading: () => <p>Loading chart…</p>
})
export default function ApprovalsLayout2(): React.JSX.Element {
  return <Chart />
}
