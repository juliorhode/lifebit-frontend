import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// Redirige cualquier petición que comience con /api a tu backend
			'/api': {
				target: 'http://localhost:3000', // La URL de tu servidor backend
				changeOrigin: true, // Necesario para que el backend reciba la petición correctamente
			},
		}
	}
});
