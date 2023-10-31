export function preloader() {
    const svg = document.getElementById('bg');

    function addStar() {
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", "#star");
        use.setAttribute("transform", `translate(${Math.random() * 100}, ${Math.random() * 100}) scale(${Math.random() * 0.3})`);
        svg.appendChild(use);
        if (Math.random() > 1 - svg.childElementCount / 50) {
            svg.querySelector('use').remove();
        }
        setTimeout(addStar, Math.random() * 1000);
    }

    addStar();
}