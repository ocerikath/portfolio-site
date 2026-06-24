document.addEventListener('DOMContentLoaded', function() {
    const cardsContainer = document.querySelector('.cards-3d-container'); // Используем твой контейнер
    if (!cardsContainer) return;

    let demoCompleted = false;

    function initCards() {
        const cards = document.querySelectorAll('.ba-card');

        // Обработчик клика
        cards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('active');
            });
        });

        // Автоматическая демонстрация первой карточки
        setTimeout(() => {
            if (!demoCompleted) {
                const firstCard = document.querySelector('.ba-card');
                if (firstCard) {
                    firstCard.classList.add('active');
                    setTimeout(() => {
                        firstCard.classList.remove('active');
                        demoCompleted = true;
                    }, 2000);
                }
            }
        }, 1500);

        // Hover-подсказка для первой карточки
        const firstCard = document.querySelector('.ba-card');
        if (firstCard) {
            const hoverHint = document.createElement('div');
            hoverHint.className = 'hover-hint';
            firstCard.appendChild(hoverHint);

            function removeHint() {
                setTimeout(() => {
                    hoverHint.style.opacity = '0';
                    setTimeout(() => hoverHint.remove(), 300);
                }, 500);
                firstCard.removeEventListener('mouseenter', removeHint);
                firstCard.removeEventListener('click', removeHint);
            }

            firstCard.addEventListener('mouseenter', removeHint);
            firstCard.addEventListener('click', removeHint);
        }
    }

    // Intersection Observer — запускаем скрипт при появлении контейнера в зоне видимости
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initCards();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(cardsContainer);
});

// Стили для hover и демо
const additionalStyles = `
    .demo-indicator {
        margin-top: 15px;
        padding: 8px 16px;
        background: rgba(159, 155, 255, 0.2);
        border-radius: 8px;
        font-size: 14px;
        animation: fadeInUp 0.5s ease;
        transition: opacity 0.3s ease;
        border: 1px solid rgba(159, 155, 255, 0.3);
    }
    
    .hover-hint {
        position: absolute;
        bottom: 15px;
        right: 15px;
        font-size: 12px;
        color: rgba(255,255,255,0.7);
        background: rgba(0,0,0,0.3);
        padding: 4px 8px;
        border-radius: 6px;
        pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 10;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = additionalStyles;
document.head.appendChild(styleSheet);
