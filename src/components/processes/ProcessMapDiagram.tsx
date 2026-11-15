import { useId, useRef, useState } from "react";
import {
  categories,
  type ProcessMap,
  type ProcessSector,
} from "../../types/processLab";
import { downloadFile } from "../../lib/processes/storage";
const lines = (text: string, length = 27) =>
  text
    .split(/\s+/)
    .flatMap((word) => word.match(new RegExp(`.{1,${length}}`, "gu")) ?? [])
    .reduce<string[]>((rows, word) => {
      if (!rows.length || rows[rows.length - 1].length + word.length > length)
        rows.push(word);
      else rows[rows.length - 1] += ` ${word}`;
      return rows;
    }, []);
export function ProcessMapDiagram({
  map,
  selected,
  onSelect,
  onMove,
  onSectorSelect,
  exportable = false,
}: {
  map: ProcessMap;
  selected?: string;
  onSelect: (id: string) => void;
  onMove?: (id: string, category: (typeof categories)[number]) => void;
  onSectorSelect?: (sector: ProcessSector) => void;
  exportable?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; x: number; y: number } | null>(null);
  const marker = useId().replace(/:/g, "");
  const rows = categories.map((category) => {
    const nodes = map.nodes.filter((n) => n.category === category);
    return {
      category,
      nodes,
      height: Math.max(110, Math.ceil(nodes.length / 3) * 82 + 40),
    };
  });
  const sectors = rows.map((row, index) => ({
    ...row,
    y: 50 + rows.slice(0, index).reduce((sum, r) => sum + r.height + 14, 0),
  }));
  const top = 50 + rows.reduce((sum, row) => sum + row.height + 14, 0);
  const positions = new Map(
    sectors.flatMap((row) =>
      row.nodes.map((node, index) => [
        node.id,
        {
          x: 140 + (index % 3) * 250,
          y: row.y + 38 + Math.floor(index / 3) * 82,
        },
      ]),
    ),
  );
  const height = top + 35;
  return (
    <div className="lab-diagram">
      <div className="actions">
        <button
          className="secondary"
          onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}
          aria-label="Reducir zoom del mapa"
        >
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          className="secondary"
          onClick={() => setZoom(Math.min(2, zoom + 0.2))}
          aria-label="Aumentar zoom del mapa"
        >
          +
        </button>
        {exportable && (
          <button
            className="secondary"
            onClick={() => {
              if (svg.current)
                downloadFile(
                  "mapa-procesos.svg",
                  svg.current.outerHTML,
                  "image/svg+xml",
                );
            }}
          >
            Exportar SVG
          </button>
        )}
      </div>
      <p className="muted">
        Desplazá el espacio de trabajo para ver el mapa completo. Seleccioná un
        proceso para leer sus propiedades.
        {onMove &&
          " Podés arrastrarlo a otro sector o cambiar su categoría con el selector del panel."}
      </p>
      <div
        className="lab-diagram-scroll"
        tabIndex={0}
        aria-label="Espacio de trabajo del mapa"
      >
        <svg
          ref={svg}
          xmlns="http://www.w3.org/2000/svg"
          width={1000 * zoom}
          height={height * zoom}
          viewBox={`0 0 1000 ${height}`}
          role="group"
          aria-label={map.name}
          onPointerUp={(event) => {
            const start = drag.current;
            drag.current = null;
            if (
              !start ||
              !onMove ||
              Math.hypot(event.clientX - start.x, event.clientY - start.y) < 12
            )
              return;
            const point = event.currentTarget.createSVGPoint();
            point.x = event.clientX;
            point.y = event.clientY;
            const matrix = event.currentTarget.getScreenCTM();
            if (!matrix) return;
            const local = point.matrixTransform(matrix.inverse());
            const sector = sectors.find(
              (row) =>
                local.y >= row.y &&
                local.y <= row.y + row.height &&
                local.x >= 120 &&
                local.x <= 890,
            );
            if (sector) onMove(start.id, sector.category);
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <title>{map.name}</title>
          <rect width="1000" height={height} fill="#fffdfa" />
          <defs>
            <marker
              id={marker}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10Z" fill="#9361aa" />
            </marker>
          </defs>
          <text
            x="500"
            y="27"
            textAnchor="middle"
            fontSize="18"
            fontFamily="sans-serif"
            fill="#604178"
          >
            {map.name}
          </text>
          {(
            [
              {
                id: "needs",
                x: 8,
                width: 110,
                cx: 63,
                color: "#f1e8f8",
                title: ["Partes", "interesadas"],
                text: map.needs,
              },
              {
                id: "result",
                x: 898,
                width: 94,
                cx: 945,
                color: "#fff0df",
                title: ["Resultados", "Satisfacción"],
                text: map.result,
              },
            ] as const
          ).map((side) => (
            <g
              key={side.id}
              role={onSectorSelect ? "button" : undefined}
              tabIndex={onSectorSelect ? 0 : undefined}
              aria-label={
                side.id === "needs"
                  ? "Sector: Partes interesadas y necesidades"
                  : "Sector: Resultados y satisfacción"
              }
              onClick={() => onSectorSelect?.(side.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSectorSelect?.(side.id);
                }
              }}
            >
              <rect
                x={side.x}
                y="50"
                width={side.width}
                height={top - 64}
                rx="14"
                fill={side.color}
              />
              {side.title.map((text, i) => (
                <text
                  key={text}
                  x={side.cx}
                  y={74 + i * 18}
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fill="#604178"
                >
                  {text}
                </text>
              ))}
              {lines(side.text, 13)
                .slice(0, 12)
                .map((text, i) => (
                  <text
                    key={i}
                    x={side.cx}
                    y={130 + i * 21}
                    textAnchor="middle"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fill="#604178"
                  >
                    {text}
                  </text>
                ))}
            </g>
          ))}
          {sectors.map((row, index) => (
            <g
              key={row.category}
              role={onSectorSelect ? "button" : undefined}
              tabIndex={onSectorSelect ? 0 : undefined}
              aria-label={`Sector: ${row.category}`}
              onClick={() => onSectorSelect?.(row.category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSectorSelect?.(row.category);
                }
              }}
            >
              <rect
                x="126"
                y={row.y}
                width="766"
                height={row.height}
                rx="14"
                fill={["#f0e6f7", "#fcecf4", "#eef4e9", "#fff2de"][index]}
              />
              <text
                x="145"
                y={row.y + 24}
                fontSize="15"
                fontWeight="bold"
                fontFamily="sans-serif"
                fill="#604178"
              >
                {row.category}
              </text>
            </g>
          ))}
          {map.relations.map((edge) => {
            const from = positions.get(edge.from),
              to = positions.get(edge.to);
            if (!from || !to) return null;
            const same = from.y === to.y;
            return (
              <path
                key={edge.id}
                d={
                  same
                    ? `M${from.x + 232} ${from.y + 30} L${to.x} ${to.y + 30}`
                    : `M${from.x + 116} ${from.y + 62} C${from.x + 116} ${from.y + 100},${to.x + 116} ${to.y - 20},${to.x + 116} ${to.y}`
                }
                stroke="#9361aa"
                strokeWidth={
                  edge.from === selected || edge.to === selected ? 3 : 1.5
                }
                opacity={
                  selected && edge.from !== selected && edge.to !== selected
                    ? 0.25
                    : 0.65
                }
                fill="none"
                markerEnd={`url(#${marker})`}
              >
                <title>{edge.label}</title>
              </path>
            );
          })}
          {map.nodes.map((node) => {
            const p = positions.get(node.id)!;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`Proceso: ${node.name}`}
                aria-pressed={selected === node.id}
                onClick={() => onSelect(node.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(node.id);
                  }
                }}
                onPointerDown={(e) => {
                  onSelect(node.id);
                  drag.current = { id: node.id, x: e.clientX, y: e.clientY };
                  e.currentTarget.ownerSVGElement?.setPointerCapture(
                    e.pointerId,
                  );
                }}
                style={{ cursor: onMove ? "grab" : "pointer" }}
              >
                <title>{node.name}</title>
                <rect
                  x={p.x}
                  y={p.y}
                  width="232"
                  height="62"
                  rx="10"
                  fill={selected === node.id ? "#e1ccec" : "#fffdfd"}
                  stroke="#a381b6"
                  strokeWidth={selected === node.id ? 3 : 1}
                />
                {lines(node.name)
                  .slice(0, 3)
                  .map((line, i) => (
                    <text
                      key={i}
                      x={p.x + 116}
                      y={p.y + 23 + i * 16}
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="sans-serif"
                      fill="#604178"
                      pointerEvents="none"
                    >
                      {line}
                    </text>
                  ))}
              </g>
            );
          })}
        </svg>
      </div>
      <details className="lab-relations">
        <summary>Relaciones del mapa ({map.relations.length})</summary>
        <ul>
          {map.relations.map((edge) => (
            <li key={edge.id}>
              {map.nodes.find((n) => n.id === edge.from)?.name} →{" "}
              {map.nodes.find((n) => n.id === edge.to)?.name}:{" "}
              {edge.label || "Relación por definir"}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
