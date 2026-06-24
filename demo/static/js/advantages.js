document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("advantagesSlider");

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("dragging");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("dragging");
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("dragging");
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();

        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.2; // скорость
        slider.scrollLeft = scrollLeft - walk;
    });
});


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
