import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>hello</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  test('renders the cut-paper fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Ojej! Coś poszło nie tak/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zagraj od nowa/i })).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
