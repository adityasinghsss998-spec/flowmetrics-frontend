'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component')
  }
  return context
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div data-slot="tabs" className={cn('flex flex-col gap-4', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-8 items-center justify-start rounded-[4px] bg-[var(--fm-surface)] p-0.5 border border-border',
        className
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs()
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-[2px] px-3 py-1 font-mono text-xs font-medium cursor-pointer outline-none focus-visible:outline-1 focus-visible:outline-[var(--fm-accent)] disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-[var(--fm-surface-raised)] text-[var(--fm-text)] border border-[var(--fm-line)]'
          : 'fm-nav-link text-[var(--fm-text-muted)]',
        className
      )}
      {...props}
    >
      <span>{children}</span>
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs()
  if (selectedValue !== value) return null

  return (
    <div
      role="tabpanel"
      data-state={selectedValue === value ? 'active' : 'inactive'}
      data-slot="tabs-content"
      className={cn('outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
