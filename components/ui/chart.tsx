import type React from "react"

export const Chart = () => {
  return null
}

export const ChartContainer = ({
  children,
  data,
  xAxisKey,
  yAxisWidth,
  className,
}: {
  children: React.ReactNode
  data: any[]
  xAxisKey: string
  yAxisWidth: number
  className?: string
}) => {
  return <div className={className}>{children}</div>
}

export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const ChartTooltipContent = () => {
  return null
}

export const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const ChartLegendContent = () => {
  return null
}

export const ChartGrid = () => {
  return null
}

export const ChartXAxis = () => {
  return null
}

export const ChartYAxis = () => {
  return null
}

export const ChartArea = () => {
  return null
}

export const ChartLine = () => {
  return null
}

export const ChartBar = () => {
  return null
}

