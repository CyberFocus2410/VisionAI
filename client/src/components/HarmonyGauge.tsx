import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HarmonyGaugeProps {
  score: number; // 0 to 1
  label: string;
  size?: number;
}

export function HarmonyGauge({ score, label, size = 200 }: HarmonyGaugeProps) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - score * circumference;
  
  // Color based on score
  let colorClass = "text-red-500";
  if (score > 0.4) colorClass = "text-amber-500";
  if (score > 0.7) colorClass = "text-emerald-500";

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth="12"
          />
          {/* Progress Circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("fill-none drop-shadow-lg", colorClass)}
            strokeWidth="12"
            strokeLinecap="round"
            stroke="currentColor"
            strokeDasharray={circumference}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-display"
          >
            {Math.round(score * 100)}%
          </motion.span>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Harmony
          </span>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "mt-4 px-4 py-1.5 rounded-full font-medium text-sm border",
          score > 0.7 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : score > 0.4 
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-red-50 border-red-200 text-red-700"
        )}
      >
        {label}
      </motion.div>
    </div>
  );
}
