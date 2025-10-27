import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Środowisko testowe
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./test/setup.ts'],
    
    // Globalne ustawienia
    globals: true,
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/env.d.ts',
        'src/types.ts',
        'src/db/database.types.ts',
      ],
      // Progi coverage - odkomentuj gdy będziesz gotowy
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 70,
      //   statements: 70,
      // },
    },
    
    // Izolacja testów
    isolate: true,
    
    // Exclude
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    
    // Include
    include: ['test/unit/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    
    // Watch options
    watch: false,
  },
  
  // Resolve aliases (zgodnie z tsconfig.json)
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});


