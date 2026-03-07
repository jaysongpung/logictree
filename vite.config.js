import tailwindcss from '@tailwindcss/vite';

export default {
  base: '/logictree/',
  plugins: [tailwindcss()],
  server: {
    open: true,
    host: true,
  },
};
