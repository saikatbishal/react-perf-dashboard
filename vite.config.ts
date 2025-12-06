// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts'; // We need this to generate types

// You might need to install this plugin: 
// npm install -D vite-plugin-dts
export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true }), // Generates .d.ts files
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactPerfDashboard',
      fileName: 'react-perf-dashboard',
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});