import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Sparkline = ({ data, lineColor = '#00B894' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-24 h-8"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <motion.g
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              animationDuration={0} // Recharts animasyonunu devre dışı bırak
            />
          </motion.g>
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export { Sparkline };
