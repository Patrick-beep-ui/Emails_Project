import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { AuthProvider } from './contexts/auth-context';

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./pages/**/*.{jsx,tsx}', { eager: true });
    console.log(pages); 
    return pages[`./pages/${name}.tsx`]?.default || pages[`./pages/${name}.jsx`]?.default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AuthProvider> 
      <App {...props} />
    </AuthProvider>
  );
  },
});
