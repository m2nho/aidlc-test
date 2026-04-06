import { describe, it, expect, vi, beforeEach } from 'vitest';
import Logger from '@/infrastructure/Logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    Logger.info('Test info message', { key: 'value' });

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][1]).toBe('Test info message');

    consoleSpy.mockRestore();
  });

  it('should log warn messages', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Logger.warn('Test warn message');

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][1]).toBe('Test warn message');

    consoleSpy.mockRestore();
  });

  it('should log error messages', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Logger.error('Test error message', new Error('Test error'));

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][1]).toBe('Test error message');

    consoleSpy.mockRestore();
  });
});
