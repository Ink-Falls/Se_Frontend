import { describe, it, expect } from 'vitest';

describe('Global afterEach cleanup', () => {
  it('clears document.body.innerHTML after a test', () => {
    // Set some content in the document body
    document.body.innerHTML = '<div id="test-element">Hello, World!</div>';
    expect(document.body.innerHTML).toContain('Hello, World!'); // Verify content is set
  });

  it('ensures document.body.innerHTML is cleared', () => {
    // Verify that the body is cleared after the previous test
    expect(document.body.innerHTML).toBe(''); // Should be empty
  });
});