import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const GoodComponent = () => <div>All Good</div>;
const BrokenComponent = () => {
  throw new Error('Test crash');
};

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('All Good')).toBeInTheDocument();
  });

  it('catches render error and displays fallback UI', () => {
    // Suppress console.error in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom Error View</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error View')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });
});
