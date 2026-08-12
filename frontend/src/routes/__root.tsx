import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Assessment Dashboard
          </h1>
          <p className="text-textMuted mt-2">Demonstrating Clean Architecture & Modern UI</p>
        </header>
        <Outlet />
      </div>
    </div>
  ),
})
