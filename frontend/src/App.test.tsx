import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Index } from './routes/index.lazy'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

describe('Index Page UI', () => {
  it('renders the Load Users button initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Index />
      </QueryClientProvider>
    )
    
    const button = screen.getByText('Load Users')
    expect(button).toBeDefined()
  })
})
