'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export type Env = 'production' | 'staging' | 'development'

interface EnvironmentContextType {
  env: Env
  setEnv: (env: Env) => void
}

const EnvironmentContext = createContext<EnvironmentContextType>({
  env: 'production',
  setEnv: () => {},
})

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [env, setEnv] = useState<Env>('production')
  
  return (
    <EnvironmentContext.Provider value={{ env, setEnv }}>
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider')
  }
  return context
}
