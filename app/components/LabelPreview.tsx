import type { LabelConfig } from "../../src/label";
import { resolveIcon } from "../../src/fa-icons";
import { FONTS, resolveVariant } from "../../src/fonts";

interface LabelPreviewProps {
  config: LabelConfig;
}

export function LabelPreview({ config }: LabelPreviewProps) {
  const { width, height, cornerRadius, borderWidth, textMargin } = config;
  const primaryCssFont = FONTS[config.fontFamily].cssFamily;
  const primaryCssWeight = resolveVariant(config.fontFamily, config.fontWeight).cssWeight;
  const subtitleKey = config.subtitleFontFamily ?? config.fontFamily;
  const subtitleWeight = config.subtitleFontWeight ?? "regular";
  const subtitleCssFont = FONTS[subtitleKey].cssFamily;
  const subtitleCssWeight = resolveVariant(subtitleKey, subtitleWeight).cssWeight;

  // Inner area after border
  const innerW = width - borderWidth * 2 - textMargin * 2;
  const innerH = height - borderWidth * 2 - textMargin * 2;

  // Icon resolution
  const iconCodepoint = config.icon ? resolveIcon(config.icon) : undefined;
  const hasIcon = !!iconCodepoint;

  // Layout calculations (mirrors label.ts logic)
  const iconZoneW = hasIcon ? innerH * 0.85 : 0;
  const sepW = hasIcon ? 0.8 : 0;
  const textZoneW = innerW - iconZoneW - sepW;

  // Positioning
  const centerX = width / 2;
  const centerY = height / 2;

  const isRight = config.iconPosition === "right";

  // Icon center X
  const iconCX = isRight
    ? centerX + (innerW / 2 - iconZoneW / 2)
    : centerX - (innerW / 2 - iconZoneW / 2);

  // Separator X
  const sepX = isRight
    ? centerX + (innerW / 2 - iconZoneW - textMargin)
    : centerX - (innerW / 2 - iconZoneW - textMargin);

  // Text center X
  const textCX = isRight
    ? centerX - (innerW / 2 - textZoneW / 2)
    : centerX + (innerW / 2 - textZoneW / 2);
  // If no icon, text is centered
  const actualTextCX = hasIcon ? textCX : centerX;

  // Font sizes: OpenSCAD text(size=) measures ascent (~72% of em-square),
  // while SVG font-size measures the full em-square. Scale up to match.
  const svgScale = 1 / 0.72;
  const primarySize = config.fontSize * svgScale;
  const subtitleSize = (config.subtitleFontSize ?? config.fontSize * 0.6) * svgScale;

  // Vertical positioning when subtitle is present (mirrors label.ts h1Y/h2Y)
  const hasSubtitle = !!config.labelText2;
  const primaryY = hasSubtitle ? centerY - innerH * 0.18 : centerY;
  const subtitleY = centerY + innerH * 0.28;

  // SVG padding for drop shadow
  const pad = 4;

  return (
    <div className="w-full">
      <svg
        viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
        className="w-full drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {/* Base plate (color 1) — dark surface */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={cornerRadius}
          ry={cornerRadius}
          fill="#27272a"
          stroke="#3f3f46"
          strokeWidth={0.3}
        />

        {/* Border ring (color 2) */}
        {config.hasBorder && (
          <rect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={width - borderWidth}
            height={height - borderWidth}
            rx={cornerRadius - borderWidth / 2}
            ry={cornerRadius - borderWidth / 2}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={borderWidth}
          />
        )}

        {hasIcon && (
          <>
            {/* Icon */}
            <text
              x={iconCX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: '"Font Awesome 7 Free"',
                fontWeight: 900,
                fontSize: `${iconZoneW * 0.6}px`,
              }}
              fill="#e4e4e7"
            >
              {iconCodepoint}
            </text>

            {/* Separator bar */}
            <line
              x1={sepX}
              y1={centerY - innerH * 0.4}
              x2={sepX}
              y2={centerY + innerH * 0.4}
              stroke="#e4e4e7"
              strokeWidth={sepW}
              strokeLinecap="round"
            />
          </>
        )}

        {/* Primary text */}
        <text
          x={actualTextCX}
          y={primaryY}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: `${primarySize}px`,
            fontFamily: primaryCssFont,
            fontWeight: primaryCssWeight,
          }}
          fill="#f4f4f5"
        >
          {config.labelText || "LABEL"}
        </text>

        {/* Subtitle */}
        {hasSubtitle && (
          <text
            x={actualTextCX}
            y={subtitleY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: `${subtitleSize}px`,
              fontFamily: subtitleCssFont,
              fontWeight: subtitleCssWeight,
            }}
            fill="#a1a1aa"
          >
            {config.labelText2}
          </text>
        )}
      </svg>
    </div>
  );
}
