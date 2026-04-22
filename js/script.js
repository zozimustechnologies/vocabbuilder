// VocabBuilder Developer Documentation - Interactive Features

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
    block.style.position = 'relative';
    block.style.cursor = 'pointer';
    
    block.addEventListener('click', function() {
      const code = this.textContent;
      copyToClipboard(code, this);
    });
  });

  // Active navigation highlighting
  highlightActiveNav();
  window.addEventListener('scroll', highlightActiveNav);
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

function highlightActiveNav() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}
