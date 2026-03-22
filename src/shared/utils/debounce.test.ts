import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delays execution of the function', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets the timer if called again before the wait time is up', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    vi.advanceTimersByTime(100);
    
    // Call again, which should reset the 200ms timer
    debounced();
    vi.advanceTimersByTime(100);
    expect(callback).not.toHaveBeenCalled(); // 200ms haven't passed since SECOND call

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1); // Now 200ms have passed since SECOND call
  });

  it('preserves arguments and context', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    const context = { value: 42 };
    debounced.call(context, 'arg1', 'arg2');

    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    const callInstance = callback.mock.instances[0];
    expect(callInstance).toStrictEqual(context);
  });
});
