'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log('App was installed');
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also check for manual install button if no beforeinstallprompt
    setTimeout(() => {
      if (!showInstallButton && !isInstalled && 'serviceWorker' in navigator) {
        setShowInstallButton(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showInstallButton, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Manual install for browsers that don't support beforeinstallprompt
      alert('To install this app, please use your browser\'s "Add to Home Screen" or "Install App" option from the menu.');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Reset the deferred prompt variable
    setDeferredPrompt(null);
    setShowInstallButton(false);

    console.log(`User response to the install prompt: ${outcome}`);
  };

  if (isInstalled || !showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      {/* <p className="text-sm mb-2">Install Test App</p>
      <button
        onClick={handleInstallClick}
        className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
      >
        Install
      </button> */}
    </div>
  );
}
