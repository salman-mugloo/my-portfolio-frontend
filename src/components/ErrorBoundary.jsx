import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    if (isDevelopment) {
      // Development: log full error + component stack
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
    } else {
      // Production: log only error message
      console.error('ErrorBoundary caught an error:', error.message || 'An unexpected error occurred');
    }

    // Store error details in state for potential future use
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-4 text-white">
                Something went wrong
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                Please refresh the page
              </p>
            </div>
            
            <button
              onClick={this.handleReload}
              className="px-8 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all text-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

export default ErrorBoundary;

