import '@testing-library/jest-dom';

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve(''))
  },
});

// Mock SVG imports - this will be handled by react-scripts configuration

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});