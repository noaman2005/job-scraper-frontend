export const triggerConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    const particles = Math.floor(count * particleRatio);
    
    for (let i = 0; i < particles; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      confetti.style.backgroundColor = ['#ff0080', '#ff8c00', '#40e0d0', '#7b68ee'][Math.floor(Math.random() * 4)];
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
