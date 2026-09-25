"use client";

import { motion } from "motion/react";

export function ShutterButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled}
      whileTap={{ scale: 0.88 }}
      className="relative flex items-center justify-center rounded-full border-4 border-white/80 bg-transparent disabled:opacity-40"
      style={{ height: 72, width: 72 }}
      aria-label="Capture"
    >
      <motion.span
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.75, backgroundColor: "#a3e635" }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="h-14 w-14 rounded-full bg-white"
      />
    </motion.button>
  );
}
