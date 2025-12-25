import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorPosition } from '@/hooks/useCursorSync';

interface CursorOverlayProps {
  cursors: CursorPosition[];
}

// Cursor SVG component
const CursorIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))` }}
  >
    <path
      d="M5.65376 3.45474L19.7449 11.7551C20.5174 12.2127 20.3767 13.3584 19.5143 13.6141L13.0749 15.5213L10.4717 21.6849C10.1265 22.5144 8.95046 22.4316 8.72185 21.5631L4.38929 4.76469C4.19053 4.00959 4.94052 3.35992 5.65376 3.45474Z"
      fill={color}
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CursorOverlay = memo(({ cursors }: CursorOverlayProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.user_id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
              left: { duration: 0.1, ease: 'linear' },
              top: { duration: 0.1, ease: 'linear' },
            }}
            className="absolute"
            style={{
              transform: 'translate(-3px, -3px)',
            }}
          >
            {/* Cursor icon */}
            <CursorIcon color={cursor.color} />
            
            {/* Username label */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-5 top-4 whitespace-nowrap"
            >
              <div 
                className="px-2 py-0.5 rounded-md text-xs font-medium text-white shadow-lg"
                style={{ 
                  backgroundColor: cursor.color,
                  boxShadow: `0 2px 8px ${cursor.color}40`
                }}
              >
                {cursor.username || 'Anonim'}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

CursorOverlay.displayName = 'CursorOverlay';

export default CursorOverlay;
