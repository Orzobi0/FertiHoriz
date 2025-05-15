import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import { Maximize, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import { formatDate } from "@/lib/dateUtils.jsx";

// ────────────────────────────────────────────────────────────────────────────────
//  Utilidades
// ────────────────────────────────────────────────────────────────────────────────
const TEMP_MIN = 35.0;
const TEMP_MAX = 37.5;
const GRAPH_H = 300; // solo parte de temperatura
const X_AXIS_H = 60;
const MUCUS_H = 80;
const Y_PADDING = 20;
const LABEL_W = 40; // ancho de la etiqueta ºC

function buildTimeline(records, totalDays) {
  // Encuentra la fecha del primer registro real
  const firstRecord = records.find(r => r.date);
  const firstDate = firstRecord ? new Date(firstRecord.date) : null;

  const byDay = Object.fromEntries(
    records.map((r) => [r.cycleDay, r])
  );
  return Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const base = byDay[day] ?? {
      id: `placeholder-${day}`,
      cycleDay: day,
      temperature: null,
      mucusAppearance: "",
      mucusSensation: "",
    };
    // Calcula la fecha aunque no haya registro
    return {
      ...base,
      date: firstDate
        ? new Date(firstDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
        : null,
    };
  });
}

function buildPath(points) {
  // Une puntos SOLO si son días consecutivos
  let d = "";
  points.forEach((p, idx) => {
    if (!p) return;
    const prev = points[idx - 1];
    const cmd = prev ? "L" : "M";
    d += `${cmd} ${p.x}% ${p.y} `;
  });
  return d.trim();
}

// ────────────────────────────────────────────────────────────────────────────────
//  Componente principal
// ────────────────────────────────────────────────────────────────────────────────
export default function CycleGraph({ cycle, displayMode = "short" }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });


  // 1) Ordenamos registros por fecha
  const sorted = useMemo(
    () =>
      cycle?.records.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ) ?? [],
    [cycle]
  );

  // 2) Timeline completo de 28 d (mínimo)
  const maxDay = Math.max(
    28,
    ...sorted.map((r) => r.cycleDay ?? 0)
  );
  const timeline = useMemo(
    () => buildTimeline(sorted, maxDay),
    [sorted, maxDay]
  );

  // 3) Según modo, recortamos la vista
const visible = useMemo(() => {
  if (displayMode === "full" || isFullScreen) return timeline;

  // Último índice donde hay temperatura real
  const lastDataIdx = timeline.findLastIndex(
    (r) => r.temperature != null && r.temperature !== ""
  );

  // Si todavía no hay datos, muestra los primeros 5 días
  if (lastDataIdx === -1) return timeline.slice(0, 5);

  // Ventana de 5 días que incluye SIEMPRE el último dato registrado
  const start = Math.max(0, lastDataIdx - 4);
  return timeline.slice(start, start + 5);
}, [timeline, displayMode, isFullScreen]);


  const columnW = 100 / visible.length;

  // 4) Puntos de temperatura (solo los que tienen dato)
const COL_W_PX = 60;              // ancho fijo de cada columna en el viewBox

// 4) Puntos de temperatura (centro de cada columna, en píxeles)
const points = useMemo(() => {
  return visible.map((r, idx) => {
    if (r.temperature == null || r.temperature === "") return null;
    const x = LABEL_W + idx * COL_W_PX + COL_W_PX / 2;   
    const y =
      GRAPH_H -
      Y_PADDING -
      ((parseFloat(r.temperature) - TEMP_MIN) /
        (TEMP_MAX - TEMP_MIN)) *
        (GRAPH_H - 2 * Y_PADDING);
    return { ...r, x, y };
  });
}, [visible]);

function buildPath(pts) {
  // Une solo los días consecutivos con dato
  let d = "";
  let started = false;
  pts.forEach((p) => {
    if (!p) {
      started = false;
      return;
    }
    const cmd = started ? "L" : "M";
    d += `${cmd} ${p.x} ${p.y} `;
    started = true;
  });
  return d.trim();
}
const pathData = useMemo(() => buildPath(points), [points]);

  // 5) Si no hay NINGÚN dato, mensaje sencillo
  const anyData = points.some(Boolean);
  if (!anyData)
    return (
      <div className="text-center py-10 text-muted-foreground">
        No hay datos suficientes para mostrar la gráfica.
      </div>
    );

  // ───── UI de la gráfica (reutilizada en mini y completa) ─────



const GraphSVG = (
  <svg
    viewBox={`0 0 ${LABEL_W + visible.length * COL_W_PX} ${GRAPH_H + X_AXIS_H + MUCUS_H + 30}`}
    className="w-full h-auto"
    preserveAspectRatio="xMinYMin meet"
  >
    <text
      x={LABEL_W / 2}
      y={GRAPH_H + 35}
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="hsl(var(--muted-foreground))"
    >
      Fecha
    </text>
    <text
      x={LABEL_W / 2}
      y={GRAPH_H + 50}
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="hsl(var(--muted-foreground))"
    >
      Día ciclo
    </text>
    <text
      x={LABEL_W / 2}
      y={GRAPH_H + X_AXIS_H + 15}
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="hsl(var(--muted-foreground))"
    >
      Apariencia
    </text>
    <text
      x={LABEL_W / 2}
      y={GRAPH_H + X_AXIS_H + 30}
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="hsl(var(--muted-foreground))"
    >
      Sensación
    </text>

    {/* Líneas horizontales y etiquetas de temperatura */}
    {Array.from({ length: Math.round((TEMP_MAX - TEMP_MIN) / 0.1) + 1 }).map((_, i) => {
      const temp = +(TEMP_MIN + i * 0.1).toFixed(1);
      const y =
        GRAPH_H -
        Y_PADDING -
        ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) *
          (GRAPH_H - 2 * Y_PADDING);

      // Líneas principales cada 0,5 y 0,0
      const isMajor = temp % 0.5 === 0;
      const isZero = temp % 1 === 0;

      return (
        <g key={temp}>
          <line
            x1={LABEL_W}
            y1={y}
            x2={LABEL_W + visible.length * COL_W_PX}
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth={isZero ? 1.2 : isMajor ? 0.8 : 0.3}
            opacity={isZero ? 0.8 : isMajor ? 0.8 : 0.50}
          />
          {(isMajor || isZero) && (
            <text
              x={LABEL_W - 5}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
            >
              {temp.toFixed(1)}
            </text>
          )}
        </g>
      );
    })}

    {/* Columnas verticales */}
    {visible.map((_, i) => (
      <line
        key={i}
        x1={LABEL_W + i * COL_W_PX + COL_W_PX / 2}
        y1="0"
        x2={LABEL_W + i * COL_W_PX + COL_W_PX / 2}
        y2={GRAPH_H}
        stroke="hsl(var(--border)/0.3)"
        strokeWidth="0.5"
      />
    ))}

    {/* Línea de temperatura */}
<path
  d={pathData}
  stroke="hsl(var(--primary))"
  strokeWidth="2"
  fill="none"
/>

    {/* Puntos + etiquetas de fecha y día */}
{visible.map((r, idx) => {
  const baseX = LABEL_W + idx * COL_W_PX + COL_W_PX / 2;
  const p = points[idx];  // punto de temperatura
  return (
    <g key={r.id}>
      {p && (
        <circle
          cx={p.x}
          cy={p.y}
          r="6"
          fill="transparent"
          onMouseEnter={e => setTooltip({ show: true, x: p.x, y: p.y, data: r })}
          onMouseLeave={() => setTooltip({ show: false })}
          onTouchStart={e => setTooltip({ show: true, x: p.x, y: p.y, data: r })}
          onTouchEnd={() => setTooltip({ show: false })}
          style={{ cursor: "pointer" }}
        />
      )}
      {p && (
        <circle
          cx={p.x}
          cy={p.y}
          r="3"
          fill="hsl(var(--primary))"
          pointerEvents="none"
        />
      )}
          {/* Fecha */}
          <text
            x={baseX}
            y={GRAPH_H + 35}
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--foreground))"
          >
            {r.date ? formatDate(r.date) : "-"}
          </text>
          {/* Día de ciclo */}
          <text
            x={baseX}
            y={GRAPH_H + 50}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            Día {r.cycleDay}
          </text>
          {/* Apariencia */}
          <text
            x={baseX}
            y={GRAPH_H + X_AXIS_H + 15}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--foreground))"
            fontWeight="bold"
          >
            {r.mucusAppearance || "-"}
          </text>
          {/* Sensación */}
          <text
            x={baseX}
            y={GRAPH_H + X_AXIS_H + 30}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--foreground))"
            fontWeight="bold"
          >
            {r.mucusSensation || "-"}
          </text>
        </g>
      );
    })}
    {tooltip.show && tooltip.data && (
  <g>
    <rect
      x={tooltip.x + 8}
      y={tooltip.y - 30}
      width="60"
      height="28"
      rx="6"
      fill="#fff"
      stroke="hsl(var(--primary))"
      strokeWidth="1"
      opacity="0.95"
    />
    <text
      x={tooltip.x + 38}
      y={tooltip.y - 16}
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill="hsl(var(--primary))"
    >
      {tooltip.data.temperature}°C
    </text>
    <text
      x={tooltip.x + 38}
      y={tooltip.y - 8}
      textAnchor="middle"
      fontSize="6"
      fill="hsl(var(--muted-foreground))"
    >
      {formatDate(tooltip.data.date)}
    </text>
  </g>
)}
  </svg>
);

  // ───── Contenedor animado + botón de ampliar ─────
  const Wrapper = (
    <motion.div
      className="bg-white/50 backdrop-blur-md p-3 md:p-6 rounded-lg shadow-xl border border-primary/20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-primary">
          Gráfica del Ciclo
        </h3>
        {displayMode === "short" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(true)}
            className="text-primary hover:bg-primary/10"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="overflow-x-auto w-full pb-2">{GraphSVG}</div>
      {displayMode === "short" && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Mostrando los últimos 5 días. Pulsa{" "}
          <Maximize className="inline h-3 w-3" /> para ver el ciclo
          completo.
        </p>
      )}
    </motion.div>
  );

  // ───── Qué devolvemos según modo ─────
  if (displayMode === "full") return GraphSVG;

  return (
    <>
      {Wrapper}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-primary">
              Gráfica Completa del Ciclo
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </DialogHeader>
          <div className="flex-grow overflow-auto p-4">
            {GraphSVG}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

}
