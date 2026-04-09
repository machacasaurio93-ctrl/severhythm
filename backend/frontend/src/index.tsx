import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- COMPONENTE DE SEGURIDAD (ERROR BOUNDARY) ---
// Este componente captura errores graves de React para que la pantalla no se quede en blanco.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          backgroundColor: '#0f172a', 
          color: '#ef4444', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️ Error Crítico de Frontend</h1>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>La aplicación no pudo iniciarse. Probablemente falta una librería.</p>
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #334155',
            maxWidth: '800px',
            overflow: 'auto'
          }}>
            <code style={{ fontFamily: 'monospace' }}>{this.state.error?.message}</code>
          </div>
          <p style={{ marginTop: '20px', color: '#cbd5e1' }}>
            Intenta ejecutar: <code style={{ backgroundColor: '#334155', padding: '4px 8px', borderRadius: '4px' }}>npm install lucide-react</code>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se encontró el elemento raíz 'root'");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);