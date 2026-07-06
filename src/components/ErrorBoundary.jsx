import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Słowik crashed:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="app">
        <div className="game-shell">
          <div className="game-kraft">
            <div className="error-fallback">
              <div className="error-fallback-emoji">🙈</div>
              <div className="error-fallback-title">Ojej! Coś poszło nie tak</div>
              <button className="play-btn" onClick={() => window.location.reload()}>
                Zagraj od nowa
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
