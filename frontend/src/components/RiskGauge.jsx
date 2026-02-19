import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const RISK_SCORE = {
  Safe: 20,
  'Adjust Dosage': 55,
  Ineffective: 65,
  Toxic: 90,
  Unknown: 30,
}

const RISK_COLOR = {
  Safe: '#10b981',
  'Adjust Dosage': '#f59e0b',
  Ineffective: '#94a3b8',
  Toxic: '#ef4444',
  Unknown: '#64748b',
}

export default function RiskGauge({ risk, confidence }) {
  const score = RISK_SCORE[risk] || 30
  const color = RISK_COLOR[risk] || '#64748b'
  const data = [{ value: score, fill: color }]

  return (
    <div className="relative h-32 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="65%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: '#1e293b' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
        <div className="font-display text-xl font-bold" style={{ color }}>
          {score}
        </div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">risk score</div>
      </div>
    </div>
  )
}
