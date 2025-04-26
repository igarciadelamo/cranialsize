"use client"

import type * as React from "react"
import { ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Dot } from "recharts"

interface ChartProps {
  data: any[]
  children: React.ReactNode
  margin?: {
    top?: number
    right?: number
    left?: number
    bottom?: number
  }
}

export function Chart({ data, children, margin }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={margin}>
        {children}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface ChartLineProps {
  type?: string
  dataKey: string
  stroke: string
  strokeWidth?: number
  dot?: boolean | React.ReactElement
  strokeDasharray?: string
  name?: string
}

export function ChartLine({
  type = "monotone",
  dataKey,
  stroke,
  strokeWidth,
  dot,
  strokeDasharray,
  name,
}: ChartLineProps) {
  return (
    <Line
      type={type}
      dataKey={dataKey}
      stroke={stroke}
      strokeWidth={strokeWidth}
      dot={dot}
      strokeDasharray={strokeDasharray}
      name={name}
    />
  )
}

interface ChartAreaProps {
  type?: string
  dataKey: string
  fill: string
  fillOpacity?: number
}

export function ChartArea({ type = "monotone", dataKey, fill, fillOpacity }: ChartAreaProps) {
  return <Area type={type} dataKey={dataKey} fill={fill} fillOpacity={fillOpacity} />
}

interface ChartXAxisProps {
  dataKey: string
  label?: {
    value: string
    position: string
    offset: number
  }
  tickFormatter?: (value: any) => string
}

export function ChartXAxis({ dataKey, label, tickFormatter }: ChartXAxisProps) {
  return <XAxis dataKey={dataKey} label={label} tickFormatter={tickFormatter} />
}

interface ChartYAxisProps {
  label?: {
    value: string
    angle: number
    position: string
  }
  domain?: string[]
}

export function ChartYAxis({ label, domain }: ChartYAxisProps) {
  return <YAxis label={label} domain={domain} />
}

interface ChartGridProps {
  strokeDasharray?: string
}

export function ChartGrid({ strokeDasharray }: ChartGridProps) {
  return <CartesianGrid strokeDasharray={strokeDasharray} />
}

interface ChartTooltipProps {
  content?: React.ReactNode
}

export function ChartTooltip({ content }: ChartTooltipProps) {
  return <Tooltip content={content} />
}

type ChartLegendProps = {}

export function ChartLegend(_: ChartLegendProps) {
  return <Legend />
}

interface ChartDotProps {
  dataKey: string
  r: number
  stroke: string
  fill: string
  strokeWidth: number
}

export function ChartDot({ dataKey, r, stroke, fill, strokeWidth }: ChartDotProps) {
  return <Dot dataKey={dataKey} r={r} stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
}
