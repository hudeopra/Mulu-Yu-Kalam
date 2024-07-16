document.querySelector('.ph-btn').onclick = function(event) {
    event.preventDefault(); // Prevent default anchor behavior
    this.classList.add('ph-active'); // Add class to anchor
    this.querySelector('span').classList.add('tracking-out-contract'); // Add class to span

    this.querySelector('span.ph-btn__extra').classList.add('tracking-in-expand'); // Add class to span
};
