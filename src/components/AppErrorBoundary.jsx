import React from 'react'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-950 text-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">⚠️ Application Error</h1>
            <p className="text-xl mb-4">
              Something went wrong with the Qscope application.
            </p>
            <div className="text-left bg-red-900/50 p-4 rounded-lg mb-4 max-h-64 overflow-auto">
              <h3 className="font-bold mb-2">Error Details:</h3>
              <pre className="text-sm text-red-200">
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-300">Stack Trace</summary>
                  <pre className="text-xs mt-2 text-red-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
              >
                Reload Application
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} 
                className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary