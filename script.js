
document.querySelectorAll("details").forEach(detail => {
    detail.addEventListener("toggle", () => {
        if (detail.open) {
            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
