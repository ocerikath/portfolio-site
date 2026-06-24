document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll("#advantagesSlider .adv-card");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const slide = entry.target;
                const index = Array.from(slides).indexOf(slide);
                setTimeout(() => {
                    slide.classList.add("visible");
                }, index * 20); // задержка между слайдами 200ms
                observer.unobserve(slide); // один раз анимация
            }
        });
    }, {
        threshold: 0.2 // запускаем, когда элемент виден на 30%
    });

    slides.forEach(slide => observer.observe(slide));
});
