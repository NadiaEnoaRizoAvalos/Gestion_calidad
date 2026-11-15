import { useId } from "react";
import PathMap from "bpmn-js/lib/draw/PathMap";
const paths = new PathMap();
export function BpmnSymbol({ type }: { type: string }) {
  const event = [
    "start",
    "start-message",
    "intermediate",
    "intermediate-message",
    "intermediate-timer",
    "end",
    "end-message",
  ].includes(type);
  const intermediate = type.startsWith("intermediate");
  const task = [
    "task",
    "subprocess",
    "manual-task",
    "user-task",
    "service-task",
    "send-task",
    "receive-task",
  ].includes(type);
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
        {event && (
          <>
            <circle
              cx="64"
              cy="36"
              r="23"
              strokeWidth={type.startsWith("end") ? 5 : 2}
            />
            {intermediate && <circle cx="64" cy="36" r="18" />}
            {type.endsWith("message") && (
              <g data-marker="message" strokeWidth="1.4">
                <rect
                  x="53"
                  y="29"
                  width="22"
                  height="14"
                  fill={type === "end-message" ? "#745189" : "#fffdfa"}
                />
                <path
                  d="M53 29L64 37L75 29"
                  fill="none"
                  stroke={type === "end-message" ? "#fffdfa" : "#745189"}
                />
              </g>
            )}
            {type === "intermediate-timer" && (
              <g data-marker="timer" strokeWidth="1.2" fill="none">
                <circle cx="64" cy="36" r="12" />
                {Array.from({ length: 12 }, (_, i) => (
                  <path
                    key={i}
                    d="M64 24V27"
                    transform={`rotate(${i * 30} 64 36)`}
                  />
                ))}
                <path d="M64 29V36L70 39" strokeWidth="1.8" />
              </g>
            )}
          </>
        )}
        {task && (
          <>
            <rect x="18" y="12" width="92" height="48" rx="8" />
            {type === "manual-task" && (
              <path
                data-marker="manual"
                d={paths.getScaledPath("TASK_TYPE_MANUAL", {
                  abspos: { x: 35, y: 28 },
                })}
                strokeWidth=".8"
              />
            )}
            {type === "user-task" && (
              <g data-marker="user" strokeWidth=".8">
                {[
                  "TASK_TYPE_USER_1",
                  "TASK_TYPE_USER_2",
                  "TASK_TYPE_USER_3",
                ].map((name) => (
                  <path
                    key={name}
                    d={paths.getScaledPath(name, { abspos: { x: 36, y: 25 } })}
                  />
                ))}
              </g>
            )}
            {type === "service-task" && (
              <g data-marker="service" strokeWidth=".9">
                {[
                  [30, 29],
                  [37, 35],
                ].map(([x, y]) => (
                  <path
                    key={x}
                    d={paths.getScaledPath("TASK_TYPE_SERVICE", {
                      abspos: { x, y },
                    })}
                  />
                ))}
              </g>
            )}
            {["send-task", "receive-task"].includes(type) && (
              <g
                data-marker={type === "send-task" ? "send" : "receive"}
                strokeWidth="1.2"
              >
                <rect
                  x="26"
                  y="20"
                  width="21"
                  height="14"
                  fill={type === "send-task" ? "#745189" : "#fffdfa"}
                />
                <path
                  d="M26 20L36.5 27L47 20"
                  fill="none"
                  stroke={type === "send-task" ? "#fffdfa" : "#745189"}
                />
              </g>
            )}

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
