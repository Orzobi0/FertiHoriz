
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/dateUtils.jsx';

const CycleCard = ({ cycle, onOpenDetails, index }) => {
  const cycleDuration = cycle.records.length > 0 ? Math.max(...cycle.records.map(r => r.cycleDay)) : 'N/A';
  const avgTempRecords = cycle.records.filter(r => r.temperature !== null && r.temperature !== undefined);
  const avgTemp = avgTempRecords.length > 0 
    ? (avgTempRecords.reduce((sum, r) => sum + r.temperature, 0) / avgTempRecords.length).toFixed(2) + '°C'
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-xl transition-shadow duration-300 bg-white/60 backdrop-blur-md border-secondary/30 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl text-secondary">
            Ciclo del {formatDate(cycle.startDate, { day: 'numeric', month: 'long', year: 'numeric' })}
          </CardTitle>
          <CardDescription>
            {cycle.records.length} registros. Duración: {cycleDuration} días
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            Temperatura promedio: {avgTemp}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onOpenDetails(cycle)} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CycleCard;
  