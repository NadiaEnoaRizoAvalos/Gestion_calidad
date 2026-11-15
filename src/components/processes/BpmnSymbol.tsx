import { useId } from "react";
export function BpmnSymbol({ type }: { type: string }) {
  const marker = useId().replace(/:/g, "");
  return (
    <svg
      width="128"
      height="72"
      viewBox="0 0 128 72"
      aria-hidden="true"
      className="lab-symbol"
    >
      <defs>
        <marker
          id={marker}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path
            d="M0 0 L10 5 L0 10"
            fill={type === "sequence" ? "#745189" : "none"}
            stroke="#745189"
          />
        </marker>
      </defs>
      <g fill="#fffdfa" stroke="#745189" strokeWidth="2">
        {["start", "intermediate", "end"].includes(type) && (
          <>
            <circle
              cx="64"
              cy="36"
              r="23"
              strokeWidth={type === "end" ? 5 : 2}
            />
            {type === "intermediate" && <circle cx="64" cy="36" r="18" />}
          </>
        )}
        {["task", "subprocess"].includes(type) && (
          <>
            <rect x="18" y="12" width="92" height="48" rx="8" />
            {type === "subprocess" && (
              <>
                <rect x="58" y="43" width="12" height="12" />
                <path d="M64 45V53M60 49H68" />
              </>
            )}
          </>
        )}
        {["xor", "and", "or"].includes(type) && (
          <>
            <path d="M64 6 L94 36 L64 66 L34 36Z" />
            {type === "or" ? (
              <circle cx="64" cy="36" r="11" />
            ) : type === "and" ? (
              <path d="M64 23V49M51 36H77" strokeWidth="4" />
            ) : (
              <path d="M55 27L73 45M73 27L55 45" strokeWidth="4" />
            )}
          </>
        )}
        {["sequence", "message", "association"].includes(type) && (
          <>
            <path
              d="M14 36H113"
              fill="none"
              strokeDasharray={
                type === "message"
                  ? "8 5"
                  : type === "association"
                    ? "2 5"
                    : undefined
              }
              markerEnd={type === "association" ? undefined : `url(#${marker})`}
            />
            {type === "message" && <circle cx="14" cy="36" r="4" />}
          </>
        )}
        {["pool", "lane"].includes(type) && (
          <>
            <rect x="8" y="8" width="112" height="56" />
            <path d="M25 8V64" />
            {type === "lane" && <path d="M25 36H120" />}
          </>
        )}
        {type === "data" && <path d="M45 8H73L87 22V64H45ZM73 8V22H87" />}
        {type === "annotation" && (
          <>
            <path d="M43 15H30V58H43" fill="none" />
            <path d="M40 28H102M40 39H90M40 50H108" strokeWidth="1" />
          </>
        )}
      </g>
    </svg>
  );
}
