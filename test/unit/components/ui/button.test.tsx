/**
 * Przykładowy test komponentu UI z Shadcn
 * 
 * Best practices demonstrowane tutaj:
 * - Testing button variants and states
 * - Event handler testing with vi.fn()
 * - Accessibility testing
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../../helpers/test-utils';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with default variant', () => {
    // Arrange & Act
    renderWithProviders(<Button>Click me</Button>);

    // Assert
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    // Act
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    // Arrange & Act
    renderWithProviders(<Button disabled>Click me</Button>);

    // Assert
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    // Act
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    // Arrange & Act
    const { container } = renderWithProviders(
      <>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    );

    // Assert
    expect(screen.getByRole('button', { name: /default/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /destructive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ghost/i })).toBeInTheDocument();
  });

  it('should support asChild prop for custom rendering', () => {
    // Arrange & Act
    renderWithProviders(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    // Assert
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});

