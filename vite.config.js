import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'; // Import the 'resolve' function from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // Change this to your desired port
    },
    test: {
        environment: 'jsdom', // Use jsdom environment
        globals: true, //This is not necessary
        include: ['**/*.test.(js|jsx|ts|tsx)'], // Specifies which files are test files
        setupFiles: './tests/setup/setupTests.jsx',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'tests/setup/',
                '**/*.d.ts',
            ]
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'), // Assuming your 'src' folder is at the root
                // Add other aliases as needed
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'), // Assuming your 'src' folder is at the root
            // Add other aliases as needed
        },
    },
});
