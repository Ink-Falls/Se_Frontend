import '@testing-library/jest-dom'; // If using extended matchers
import { afterEach } from 'vitest';

afterEach(() => {
    document.body.innerHTML = '';
});