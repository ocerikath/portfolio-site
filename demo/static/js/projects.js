document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.project-card');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    cards.forEach(card => observer.observe(card));

    // Breath animation for hover glow
    cards.forEach(card => {
        let glow = card.querySelector('::before'); // псевдоэлемент нельзя напрямую, используем CSS animation
        card.addEventListener('mouseenter', () => {
            card.style.setProperty('--animate-glow', '1');
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--animate-glow', '0');
        });
    });
});
