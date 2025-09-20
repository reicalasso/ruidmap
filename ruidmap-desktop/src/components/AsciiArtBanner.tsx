import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AsciiArtBannerProps {
  className?: string;
}

export const AsciiArtBanner: React.FC<AsciiArtBannerProps> = ({ className = "" }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  const bannerText = `
██████╗ ██╗   ██╗██╗██████╗ ███╗   ███╗ █████╗ ██████╗ 
██╔══██╗██║   ██║██║██╔══██╗████╗ ████║██╔══██╗██╔══██╗
██████╔╝██║   ██║██║██║  ██║██╔████╔██║███████║██████╔╝
██╔══██╗██║   ██║██║██║  ██║██║╚██╔╝██║██╔══██║██╔═══╝ 
██║  ██║╚██████╔╝██║██████╔╝██║ ╚═╝ ██║██║  ██║██║     
╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     
                                                       
    ──────────── Task Management & Roadmap ─────────────
  `;

    const sparkleFrames = ['✨', '💫', '⭐', '🌟', '💥'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % sparkleFrames.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className={`ascii-banner ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative">
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 blur-md opacity-30 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          animate={{ 
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main ASCII art */}
        <motion.pre
          className="ascii-art text-center font-mono text-[8px] md:text-[10px] lg:text-xs relative z-10 text-blue-600 dark:text-blue-400"
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: "backOut",
            delay: 0.2
          }}
        >
          {bannerText}
        </motion.pre>

        {/* Animated sparkles */}
        <motion.div 
          className="absolute top-4 right-8 text-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {sparkleFrames[currentFrame]}
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-12 text-xl"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          {sparkleFrames[(currentFrame + 2) % sparkleFrames.length]}
        </motion.div>
      </div>

      {/* Typing effect subtitle */}
      <motion.div 
        className="text-center mt-4 text-sm md:text-base font-mono text-gray-600 dark:text-gray-300"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "auto", opacity: 1 }}
        transition={{ 
          duration: 2,
          delay: 1,
          ease: "easeOut"
        }}
      >
        <motion.span
          className="typing-effect"
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            borderRight: '2px solid',
          }}
          animate={{
            borderColor: ['transparent', 'currentColor', 'transparent']
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 3
          }}
        >
          &gt; Ready to organize your roadmap...
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default AsciiArtBanner;