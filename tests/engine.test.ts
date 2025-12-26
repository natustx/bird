import { describe, expect, it } from 'vitest';
import { resolveEngineMode, shouldAllowSweetisticsFallback, shouldUseSweetistics } from '../src/lib/engine.js';

describe('engine', () => {
  it('normalizes engine values and defaults to auto', () => {
    expect(resolveEngineMode()).toBe('auto');
    expect(resolveEngineMode('graphql')).toBe('graphql');
    expect(resolveEngineMode('sweetistics')).toBe('sweetistics');
    expect(resolveEngineMode('AUTO')).toBe('auto');
    expect(resolveEngineMode('nope')).toBe('auto');
  });

  it('uses GraphQL as primary in auto mode', () => {
    expect(shouldUseSweetistics('auto', false)).toBe(false);
    expect(shouldUseSweetistics('auto', true)).toBe(false);
  });

  it('forces engine selection when explicitly set', () => {
    expect(shouldUseSweetistics('sweetistics', false)).toBe(true);
    expect(shouldUseSweetistics('graphql', true)).toBe(false);
  });

  it('only allows Sweetistics fallback in auto mode', () => {
    expect(shouldAllowSweetisticsFallback('auto', true)).toBe(true);
    expect(shouldAllowSweetisticsFallback('auto', false)).toBe(false);
    expect(shouldAllowSweetisticsFallback('graphql', true)).toBe(false);
    expect(shouldAllowSweetisticsFallback('sweetistics', true)).toBe(false);
  });
});
