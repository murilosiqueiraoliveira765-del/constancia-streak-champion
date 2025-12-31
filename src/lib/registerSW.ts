/**
 * Registra o Service Worker para PWA
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers não são suportados neste navegador');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registrado com sucesso:', registration.scope);

    // Verifica atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nova versão disponível! Atualize a página.');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Verifica se o app pode ser instalado como PWA
 */
export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window || 
         (navigator as Navigator & { standalone?: boolean }).standalone === false;
}
