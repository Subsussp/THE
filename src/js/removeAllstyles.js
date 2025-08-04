export function removeAllStyles() {
  // Remove all <link rel="stylesheet"> tags except default ones (if needed)
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (link.href.includes('style.css') || link.href.includes('app.css')) {
      link.remove();
    }
  });
  
}
