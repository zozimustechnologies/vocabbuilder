// VocabBuilder - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for anchor links
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Copy code blocks on click
  const codeBlocks = document.querySelectorAll('pre');
  
  codeBlocks.forEach(block => {
    block.style.cursor = 'pointer';
    block.setAttribute('title', 'Click to copy');
    
    block.addEventListener('click', function() {
      const code = this.textContent;
      copyToClipboard(code, this);
    });
  });
});

function copyToClipboard(text, element) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = element.textContent;
    element.textContent = '✓ Copied!';
    element.style.opacity = '0.8';
    
    setTimeout(() => {
      element.textContent = originalText;
      element.style.opacity = '1';
    }, 2000);
  }).catch(() => {
    console.error('Failed to copy');
  });
}

