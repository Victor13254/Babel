import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // En producción NO se usa servidor de desarrollo ni proxy.
    // El build generará archivos estáticos que servirás con Nginx.
})
