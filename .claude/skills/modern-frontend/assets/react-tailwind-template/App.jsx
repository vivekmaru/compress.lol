import React from 'react'
import { ThemeProvider } from '@/components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen bg-background">
        {/* Your app content goes here */}
      </div>
    </ThemeProvider>
  )
}

export default App
