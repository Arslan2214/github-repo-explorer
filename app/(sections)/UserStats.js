"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Loader2 } from "lucide-react";

// Function to generate random colors for languages
const generateColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function UserStats({ languages = [], starsOverTime = [], loading = false }) {
  // Validate props and handle loading/no-data states
  if (!Array.isArray(languages) || !Array.isArray(starsOverTime)) {
    console.error("Languages and starsOverTime data should be arrays.");
    return null;
  }

  // Process languages data to calculate percentages
  const totalBytes = languages.reduce((sum, lang) => sum + lang.value, 0);
  const processedLanguages = languages.map(lang => ({
    name: lang.name,
    value: lang.value,
    percentage: ((lang.value / totalBytes) * 100).toFixed(1)
  }));

  // Generate unique colors for each language
  const languageColors = processedLanguages.reduce((acc, lang) => {
    acc[lang.name] = generateColor();
    return acc;
  }, {});

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Star Growth Over Time Chart */}
      <div className="border rounded-lg p-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Star Growth Over Time</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : starsOverTime.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={starsOverTime}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value} stars`]}
                />
                <Line 
                  type="monotone" 
                  dataKey="stars" 
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  animationDuration={1000}
                  animationBegin={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No star growth data available
          </div>
        )}
      </div>

      {/* Language Distribution */}
      <div className="border rounded-lg p-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Language Distribution</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : processedLanguages.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedLanguages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {processedLanguages.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={languageColors[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${props.payload.percentage}%`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No language data available
          </div>
        )}
      </div>
    </motion.div>
  );
}
