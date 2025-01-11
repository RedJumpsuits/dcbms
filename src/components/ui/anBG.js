import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  // Disc class to manage individual rotating elements
  class Disc {
    constructor(x, y, radius, rotation, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.rotation = rotation;
      this.color = color;
      this.speed = 0.001 + Math.random() * 0.002;
      this.centerX = x;
      this.centerY = y;
      this.distance = Math.random() * 50;
      this.offset = Math.random() * Math.PI * 2;
    }

    update(time) {
      // Create orbital motion
      this.x = this.centerX + Math.cos(time * this.speed + this.offset) * this.distance;
      this.y = this.centerY + Math.sin(time * this.speed + this.offset) * this.distance;
      this.rotation += this.speed;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      // Create gradient for each disc
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let discs = [];

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Create initial discs
    const createDiscs = () => {
      const colors = [
        'rgba(255, 0, 255, 0.3)',  // Pink
        'rgba(138, 43, 226, 0.3)', // Purple
        'rgba(0, 0, 255, 0.3)'     // Blue
      ];

      discs = [];
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 150 + Math.random() * 200;
        const rotation = Math.random() * Math.PI * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        discs.push(new Disc(x, y, radius, rotation, color));
      }
    };

    // Animation loop
    const animate = (time) => {
      ctx.fillStyle = 'rgb(17, 24, 39)'; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set blur effect
      ctx.filter = 'blur(50px)';
      
      // Update and draw all discs
      discs.forEach(disc => {
        disc.update(time);
        disc.draw(ctx);
      });

      ctx.filter = 'none';
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    createDiscs();
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
    />
  );
};

export default AnimatedBackground;