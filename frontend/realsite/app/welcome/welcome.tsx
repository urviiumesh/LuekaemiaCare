import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// HomePage component with enhanced animated background
const HomePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create dots
    interface Dot {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
      targetOpacity: number;
      flickerSpeed: number;
      color: string;
    }

    interface Firefly {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      targetOpacity: number;
      flickerSpeed: number;
      color: string;
      vx: number;
      vy: number;
      angle: number;
      angleSpeed: number;
      glowRadius: number;
    }

    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleAmount: number;
      phase: number;
    }

    interface Nebula {
      x: number;
      y: number;
      radius: number;
      color1: string;
      color2: string;
      opacity: number;
      pulseSpeed: number;
      pulseAmount: number;
      phase: number;
    }
    
    const dots: Dot[] = [];
    const fireflies: Firefly[] = [];
    const stars: Star[] = [];
    const nebulae: Nebula[] = [];
    
    const dotCount = Math.floor((canvas.width * canvas.height) / 5000); // Adjusted dot density
    const fireflyCount = Math.floor((canvas.width * canvas.height) / 10000) + 15; // Adjusted firefly count
    const starCount = 150; // Fixed number of stars
    const nebulaCount = 5; // Small number of nebulae for background effect
    
    const colors = [
      'rgba(255, 255, 255, ', // White
      'rgba(70, 180, 255, ', // Brighter blue
      'rgba(255, 100, 150, ', // Brighter pink
      'rgba(150, 255, 150, ', // Soft green
      'rgba(255, 215, 120, ' // Warm yellow
    ];
    
    // Create nebulae (background color clouds)
    const nebulaColors = [
      ['rgba(70, 0, 120, ', 'rgba(120, 0, 200, '], // Purple
      ['rgba(0, 50, 100, ', 'rgba(0, 100, 180, '], // Deep blue
      ['rgba(100, 0, 50, ', 'rgba(180, 0, 100, '], // Deep red
      ['rgba(0, 60, 60, ', 'rgba(0, 120, 120, '], // Teal
      ['rgba(60, 30, 0, ', 'rgba(120, 60, 0, ']  // Amber
    ];
    
    for (let i = 0; i < nebulaCount; i++) {
      const colorPair = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 200,
        color1: colorPair[0],
        color2: colorPair[1],
        opacity: Math.random() * 0.15 + 0.05, // Very subtle
        pulseSpeed: 0.001 + Math.random() * 0.002,
        pulseAmount: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    // Create stars (fixed background points)
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        twinkleAmount: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    // Create dots (connecting nodes)
    for (let i = 0; i < dotCount; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1.5, // Slightly smaller dots
        opacity: Math.random() * 0.6 + 0.2, // Lower base opacity
        speed: 0.2 + Math.random() * 0.3, // Slower movement for elegance
        targetOpacity: Math.random() * 0.6 + 0.2,
        flickerSpeed: 0.01 + Math.random() * 0.02, // Slower flickering
        color: colors[colorIndex]
      });
    }

    // Create fireflies (moving light points)
    const fireflyColors = [
      'rgba(255, 230, 150, ', // Warm yellow
      'rgba(255, 255, 220, ', // Soft white
      'rgba(255, 215, 120, ', // Golden yellow
      'rgba(255, 180, 100, ', // Orange glow
      'rgba(200, 255, 255, '  // Cyan white
    ];
    
    for (let i = 0; i < fireflyCount; i++) {
      const colorIndex = Math.floor(Math.random() * fireflyColors.length);
      
      fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 2, // Smaller radius for elegance
        opacity: Math.random() * 0.7 + 0.3,
        targetOpacity: Math.random() * 0.7 + 0.3,
        flickerSpeed: 0.02 + Math.random() * 0.05,
        color: fireflyColors[colorIndex],
        vx: Math.random() * 0.8 - 0.4, // Slower movement
        vy: Math.random() * 0.8 - 0.4,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        glowRadius: Math.random() * 100 + 30 // Smaller glow for elegance
      });
    }
    
    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let mouseRadius = 150;
    let mouseInfluence = false;
    
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseInfluence = true;
      
      // Timeout to reset mouse influence
      setTimeout(() => {
        mouseInfluence = false;
      }, 100);
    });
    
    // Animation function
    const animate = () => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebulae (background color clouds)
      nebulae.forEach(nebula => {
        nebula.phase += nebula.pulseSpeed;
        const pulseScale = 1 + Math.sin(nebula.phase) * nebula.pulseAmount;
        
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.radius * pulseScale
        );
        
        gradient.addColorStop(0, nebula.color2 + nebula.opacity + ')');
        gradient.addColorStop(0.5, nebula.color1 + nebula.opacity * 0.5 + ')');
        gradient.addColorStop(1, nebula.color1 + '0)');
        
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Draw stars (fixed background points)
      stars.forEach(star => {
        star.phase += star.twinkleSpeed;
        const twinkle = 1 + Math.sin(star.phase) * star.twinkleAmount;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });
      
      // Draw connections between nearby dots
      ctx.lineWidth = 0.3; // Thinner lines for elegance
      dots.forEach((dot, i) => {
        // Update opacity (flickering effect)
        if (Math.abs(dot.opacity - dot.targetOpacity) < 0.01) {
          dot.targetOpacity = Math.random() * 0.6 + 0.2;
        }
        dot.opacity += (dot.targetOpacity - dot.opacity) * dot.flickerSpeed;
        
        // Mouse interaction
        if (mouseInfluence) {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouseRadius) {
            const force = (1 - distance / mouseRadius) * 2;
            dot.x -= dx * force * 0.03;
            dot.y -= dy * force * 0.03;
          }
        }
        
        // Draw connections
        dots.forEach((otherDot, j) => {
          if (i !== j) {
            const dx = dot.x - otherDot.x;
            const dy = dot.y - otherDot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) { // Increased connection distance
              ctx.beginPath();
              ctx.moveTo(dot.x, dot.y);
              ctx.lineTo(otherDot.x, otherDot.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 120) * 0.15})`; // More subtle connections
              ctx.stroke();
            }
          }
        });
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color + dot.opacity + ')';
        ctx.fill();

        // Smoother movement with slight direction persistence
        const angle = Math.random() * Math.PI * 0.25 + (Math.atan2(dot.y - canvas.height/2, dot.x - canvas.width/2));
        dot.x += Math.cos(angle) * dot.speed;
        dot.y += Math.sin(angle) * dot.speed;
        
        // Wrap around screen edges with smooth transition
        if (dot.y < -10) {
          dot.y = canvas.height + 10;
          dot.opacity = 0; // Fade in when wrapping
        }
        if (dot.y > canvas.height + 10) {
          dot.y = -10;
          dot.opacity = 0;
        }
        if (dot.x < -10) {
          dot.x = canvas.width + 10;
          dot.opacity = 0;
        }
        if (dot.x > canvas.width + 10) {
          dot.x = -10;
          dot.opacity = 0;
        }
      });
      
      // Draw and update fireflies with enhanced glow effect
      fireflies.forEach(firefly => {
        // Update opacity (flickering effect)
        if (Math.abs(firefly.opacity - firefly.targetOpacity) < 0.01) {
          firefly.targetOpacity = Math.random() * 0.7 + 0.3;
        }
        firefly.opacity += (firefly.targetOpacity - firefly.opacity) * firefly.flickerSpeed;
        
        // Create stronger glow effect with multiple layers
        const outerGradient = ctx.createRadialGradient(
          firefly.x, firefly.y, 0,
          firefly.x, firefly.y, firefly.glowRadius
        );
        outerGradient.addColorStop(0, firefly.color + firefly.opacity * 0.4 + ')');
        outerGradient.addColorStop(1, firefly.color + '0)');
        
        const innerGradient = ctx.createRadialGradient(
          firefly.x, firefly.y, 0,
          firefly.x, firefly.y, firefly.radius * 2
        );
        innerGradient.addColorStop(0, firefly.color + firefly.opacity + ')');
        innerGradient.addColorStop(1, firefly.color + firefly.opacity * 0.2 + ')');
        
        // Draw outer glow
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = outerGradient;
        ctx.fill();
        
        // Draw inner glow
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();
        
        // Draw firefly center
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
        ctx.fillStyle = firefly.color + Math.min(1, firefly.opacity * 1.3) + ')';
        ctx.fill();
        
        // Update movement with smoother transitions
        firefly.angle += firefly.angleSpeed;
        const speed = 0.8 + Math.sin(firefly.angle * 2) * 0.3; // Slower, more elegant movement
        firefly.vx = Math.cos(firefly.angle) * speed;
        firefly.vy = Math.sin(firefly.angle) * speed;
        
        firefly.x += firefly.vx;
        firefly.y += firefly.vy;

        // Wrap around screen edges
        if (firefly.x < -firefly.glowRadius) firefly.x = canvas.width + firefly.glowRadius;
        if (firefly.x > canvas.width + firefly.glowRadius) firefly.x = -firefly.glowRadius;
        if (firefly.y < -firefly.glowRadius) firefly.y = canvas.height + firefly.glowRadius;
        if (firefly.y > canvas.height + firefly.glowRadius) firefly.y = -firefly.glowRadius;
      });
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  // Handle button hover
  const handleButtonHover = (isHovering: boolean) => {
    setIsHovering(isHovering);
  };
  
  // Handle navigation
  const handleGetStarted = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="home-page">
      <canvas 
        ref={canvasRef} 
        className="background-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDarkMode ? 'linear-gradient(to bottom, #000000, #050520)' : 'linear-gradient(to bottom, #ffffff, #e6e9ff)',
          zIndex: -1
        }}
      />
      
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>
      
      <div className="content"
        style={{
          position: 'relative',
          zIndex: 1,
          color: isDarkMode ? 'white' : '#1a1a1a',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}
      >
        <div 
          style={{
            opacity: 0,
            animation: 'fadeIn 1.5s ease-out forwards',
            animationDelay: '0.5s'
          }}
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            marginBottom: '1rem',
            fontWeight: 200,
            letterSpacing: '8px',
            textAlign: 'center',
            background: isDarkMode ? 'linear-gradient(to right, #ffffff, #a0a0ff)' : 'linear-gradient(to right, #1a1a1a, #4040cc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: isDarkMode ? '0 0 20px rgba(255,255,255,0.2)' : '0 0 20px rgba(0,0,0,0.1)'
          }}>
            WELCOME
          </h1>
        </div>
        
        <div
          style={{
            opacity: 0,
            animation: 'fadeIn 1.5s ease-out forwards',
            animationDelay: '1s',
            maxWidth: '800px'
          }}
        >
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.4rem)',
            maxWidth: '800px',
            textAlign: 'center',
            lineHeight: '1.8',
            opacity: 0.9,
            margin: '2rem 0',
            fontWeight: 300,
            color: isDarkMode ? '#e0e0ff' : '#2a2a4a'
          }}>
            Experience a journey through an elegant digital universe.
            Explore the constellation of possibilities that await you.
          </p>
        </div>
        
        <div
          style={{
            opacity: 0,
            animation: 'fadeIn 1.5s ease-out forwards',
            animationDelay: '1.5s',
            marginTop: '2rem'
          }}
        >
          <button 
            onClick={handleGetStarted}
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
            style={{
              padding: '1rem 3rem',
              fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
              background: isHovering ? (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)') : 'transparent',
              color: isDarkMode ? 'white' : '#1a1a1a',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'}`,
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.5s ease',
              boxShadow: isHovering ? (isDarkMode ? '0 0 20px rgba(255, 255, 255, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.2)') : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>
              GET STARTED
            </span>
            <div style={{
              position: 'absolute',
              top: 0,
              left: isHovering ? '0%' : '-100%',
              width: '100%',
              height: '100%',
              background: isDarkMode ? 
                'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.2))' : 
                'linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0.1))',
              transition: 'left 0.5s ease',
              zIndex: 1
            }}></div>
          </button>
        </div>
        
        {/* Add subtle floating elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${30 + i * 20}px`,
              height: `${30 + i * 20}px`,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '50%',
              top: `${20 + i * 10}%`,
              left: `${20 + i * 20}%`,
              animation: `float ${8 + i * 2}s infinite ease-in-out`,
              opacity: 0.4 - i * 0.1
            }}></div>
          ))}
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;