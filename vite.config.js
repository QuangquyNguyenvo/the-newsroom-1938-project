import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths let the same build run at a domain root or under a sub-path.
  base: './',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]build/ },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|react-reconciler)[\\/]/,
            },
            { name: 'scene-tools', test: /node_modules[\\/](@react-three|three[\\/]examples)/ },
          ],
        },
      },
    },
  },
});
