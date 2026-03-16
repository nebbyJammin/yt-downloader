import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: ".vite/renderer/main_window",
      fallback: 'app.html',
    }),
    paths: {
      relative: true,
    }
  },
};

export default config;
