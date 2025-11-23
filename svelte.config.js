import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Use adapter-node for Docker/VPS deployments, adapter-auto for platforms like Vercel
const adapter = process.env.ADAPTER === 'node' ? adapterNode : adapterAuto;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build'
		})
	}
};

export default config;
