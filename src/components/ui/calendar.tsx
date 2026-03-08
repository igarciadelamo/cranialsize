"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import Calendar from 'react-calendar'

import '@/styles/calendar.css'
import 'react-calendar/dist/Calendar.css'

export type CalendarProps = {
  value?: Date
  onChange?: (value: Date) => void
  className?: string
} & Omit<React.ComponentProps<typeof Calendar>, 'onChange' | 'value'>

function CalendarComponent({
  value,
  onChange,
  className,
  ...props
}: CalendarProps) {
  // Using any temporarily to avoid type issues with react-calendar
  const handleDateChange = (value: any) => {
    if (value instanceof Date && onChange) {
      onChange(value)
    }
  }

  return (
    <Calendar
      value={value}
      onChange={handleDateChange}
      className={cn(
        "select-none rounded-lg shadow-sm",
        "react-calendar",
        className
      )}
      {...props}
    />
  )
}
CalendarComponent.displayName = "Calendar"

export { CalendarComponent as Calendar }
