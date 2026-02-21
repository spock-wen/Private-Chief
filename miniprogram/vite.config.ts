import { defineConfig } from 'vite';

const uniPlugin = require('@dcloudio/vite-plugin-uni').default;

export default defineConfig({
  plugins: [uniPlugin()]
});
