'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'
const data = [
  { day: 'D-6', mins: 8.2 },
  { day: 'D-5', mins: 9.1 },
  { day: 'D-4', mins: 7.4 },
  { day: 'D-3', mins: 11.2 },
  { day: 'D-2', mins: 6.8 },
  { day: 'D-1', mins: 9.9 },
  { day: 'Today', mins: 8.7 }
]
export default function TimeToPayment(): React.JSX.Element {
  if (data.length === 0) return <p>No data yet.</p>
  return (
    <div aria-label="Time to payment chart" className="rounded border p-4">
      <h2 className="font-semibold">Avg request → settle (target 10 min)</h2>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={10} stroke="red" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="mins" stroke="#00b5e3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
