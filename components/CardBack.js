import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line, Rect, G } from 'react-native-svg';

// Phase 2: Six distinct card-back designs, one per color slot. Designed to
// read as actual playing-card backs — dense, framed, edge-to-edge — not flat
// clipart. Each pattern has three visual layers:
//
//   1. Inner border frame (the "card edge" feel — every real card back has one)
//   2. Background texture (filling the field, low opacity)
//   3. Main motif (the design's signature element)
//
// Coordinate system: viewBox 0 0 100 140 (1:1.4 aspect = the card shape).
// Patterns are designed directly in card-shape coordinates so circles stay
// circular and grids stay regular.

const COLORS = {
  blue:   { bg: '#1e3a8a', accent: '#93c5fd', border: '#1e40af' },
  red:    { bg: '#7f1d1d', accent: '#fca5a5', border: '#991b1b' },
  green:  { bg: '#14532d', accent: '#86efac', border: '#166534' },
  yellow: { bg: '#713f12', accent: '#fde047', border: '#854d0e' },
  purple: { bg: '#581c87', accent: '#d8b4fe', border: '#6b21a8' },
  black:  { bg: '#0a0a0a', accent: '#a1a1aa', border: '#27272a' },
};

// Inner frame shared by all designs. 6 units inset from each edge.
function InnerFrame({ accent, opacity = 0.5 }) {
  return (
    <Rect
      x="6"
      y="6"
      width="88"
      height="128"
      rx="4"
      stroke={accent}
      strokeWidth="1"
      fill="none"
      opacity={opacity}
    />
  );
}

// --- Pattern components ----------------------------------------------------

// BLUE — Wave: dense horizontal sine arcs with foam dots between, evoking
// the tightly-packed wavelet patterns on traditional nautical card backs.
function Wave({ accent }) {
  // Eight wave lines, every ~16 units vertically. Stronger in the middle,
  // softer at top and bottom for a focal effect.
  const waves = [];
  for (let i = 0; i < 8; i++) {
    const y = 14 + i * 16;
    const dist = Math.abs(i - 3.5);
    const opacity = 0.95 - dist * 0.12;
    waves.push(
      <Path
        key={`w${i}`}
        d={`M 8 ${y} Q 25 ${y - 6}, 42 ${y} T 76 ${y} Q 84 ${y + 3}, 92 ${y}`}
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  }
  // Foam dots between waves
  const foam = [];
  for (let i = 0; i < 7; i++) {
    const y = 22 + i * 16;
    const xs = i % 2 === 0 ? [22, 50, 78] : [36, 64];
    xs.forEach((x, j) => {
      foam.push(<Circle key={`f${i}-${j}`} cx={x} cy={y} r="0.8" fill={accent} opacity="0.55" />);
    });
  }
  return (
    <G>
      <InnerFrame accent={accent} />
      {waves}
      {foam}
    </G>
  );
}

// RED — Chevron: tightly stacked V-shapes filling the field. Alternating
// large/small chevrons give a more dynamic rhythm than uniform spacing.
function Chevron({ accent }) {
  // Eight chevrons stacked vertically, alternating wide and narrow.
  const chevrons = [];
  for (let i = 0; i < 9; i++) {
    const y = 18 + i * 13;
    const isWide = i % 2 === 0;
    const halfW = isWide ? 38 : 28;
    const depth = 8;
    const opacity = 0.95 - Math.abs(i - 4) * 0.1;
    chevrons.push(
      <Path
        key={`c${i}`}
        d={`M ${50 - halfW} ${y + depth} L 50 ${y - depth / 2} L ${50 + halfW} ${y + depth}`}
        stroke={accent}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    );
  }
  return (
    <G>
      <InnerFrame accent={accent} />
      {chevrons}
    </G>
  );
}

// GREEN — Vine: two mirrored trees (one descending from the top, one rising
// from the bottom) whose branches and leaves spread across the middle and
// interlock. Generated procedurally so density matches a real botanical
// motif rather than a few hand-drawn curves.
function Vine({ accent }) {
  // Leaf shape: small almond-oval pointing along a given angle.
  // Returns an SVG <Path> centered at (cx,cy), rotated by `rot` degrees.
  const leaf = (key, cx, cy, rot, scale = 1, opacity = 0.7) => {
    const w = 3 * scale;
    const h = 1.6 * scale;
    return (
      <Path
        key={key}
        d={`M ${-w} 0 Q 0 ${-h}, ${w} 0 Q 0 ${h}, ${-w} 0 Z`}
        fill={accent}
        stroke="none"
        opacity={opacity}
        transform={`translate(${cx} ${cy}) rotate(${rot})`}
      />
    );
  };

  // Generate one tree from a trunk anchor (top or bottom of card) toward the
  // opposite side. `dir` = +1 (top → middle, growing downward) or -1 (bottom
  // → middle, growing upward).
  const tree = (anchorY, dir, keyPrefix) => {
    const items = [];
    const trunkEndY = anchorY + dir * 50;

    // Trunk
    items.push(
      <Path
        key={`${keyPrefix}-trunk`}
        d={`M 50 ${anchorY} L 50 ${trunkEndY}`}
        stroke={accent}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.95"
      />
    );

    // Five branch levels along the trunk, each pair fanning out left + right.
    // Branches get longer toward the trunk's free end (closer to middle).
    const branchLevels = [
      { offset: 8,  reach: 10, lift: 4 },
      { offset: 18, reach: 14, lift: 5 },
      { offset: 28, reach: 20, lift: 6 },
      { offset: 38, reach: 26, lift: 8 },
      { offset: 48, reach: 30, lift: 10 },
    ];

    branchLevels.forEach((b, i) => {
      const startY = anchorY + dir * b.offset;
      const endY = startY + dir * b.lift;
      const leftX = 50 - b.reach;
      const rightX = 50 + b.reach;

      // Curved branches using Q (quadratic) for a natural arc.
      const ctrlOffsetY = dir * (b.lift / 2);
      items.push(
        <Path
          key={`${keyPrefix}-bL-${i}`}
          d={`M 50 ${startY} Q ${(50 + leftX) / 2} ${startY + ctrlOffsetY}, ${leftX} ${endY}`}
          stroke={accent}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
      );
      items.push(
        <Path
          key={`${keyPrefix}-bR-${i}`}
          d={`M 50 ${startY} Q ${(50 + rightX) / 2} ${startY + ctrlOffsetY}, ${rightX} ${endY}`}
          stroke={accent}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
      );

      // Leaves at the tip of each branch
      const leafRot = dir === 1 ? 30 : -30;
      items.push(leaf(`${keyPrefix}-lL-${i}`, leftX - 1, endY, -leafRot - 20, 1.1, 0.75));
      items.push(leaf(`${keyPrefix}-lR-${i}`, rightX + 1, endY, leafRot + 20, 1.1, 0.75));

      // Mid-branch leaves on the longer branches
      if (i >= 2) {
        const midLX = (50 + leftX) / 2;
        const midRX = (50 + rightX) / 2;
        const midY = startY + ctrlOffsetY;
        items.push(leaf(`${keyPrefix}-mL-${i}`, midLX, midY, -leafRot, 0.9, 0.6));
        items.push(leaf(`${keyPrefix}-mR-${i}`, midRX, midY, leafRot, 0.9, 0.6));
      }

      // Small twigs branching off the longest branches
      if (i === 4) {
        items.push(
          <Path
            key={`${keyPrefix}-twL-${i}`}
            d={`M ${leftX + 6} ${endY - dir * 2} Q ${leftX + 2} ${endY - dir * 6}, ${leftX} ${endY - dir * 8}`}
            stroke={accent}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
        items.push(
          <Path
            key={`${keyPrefix}-twR-${i}`}
            d={`M ${rightX - 6} ${endY - dir * 2} Q ${rightX - 2} ${endY - dir * 6}, ${rightX} ${endY - dir * 8}`}
            stroke={accent}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
        items.push(leaf(`${keyPrefix}-tlL-${i}`, leftX, endY - dir * 8, -leafRot - 40, 0.9, 0.65));
        items.push(leaf(`${keyPrefix}-tlR-${i}`, rightX, endY - dir * 8, leafRot + 40, 0.9, 0.65));
      }
    });

    return items;
  };

  return (
    <G>
      <InnerFrame accent={accent} />
      {/* Top tree: trunk anchored at y=10, growing down toward middle */}
      {tree(10, 1, 't')}
      {/* Bottom tree: trunk anchored at y=130, growing up toward middle */}
      {tree(130, -1, 'b')}

      {/* Central berries / accents where the canopies meet */}
      <Circle cx="32" cy="68" r="1.5" fill={accent} opacity="0.7" />
      <Circle cx="68" cy="68" r="1.5" fill={accent} opacity="0.7" />
      <Circle cx="40" cy="72" r="1.2" fill={accent} opacity="0.6" />
      <Circle cx="60" cy="72" r="1.2" fill={accent} opacity="0.6" />
      <Circle cx="50" cy="70" r="1.8" fill={accent} opacity="0.8" />
    </G>
  );
}

// YELLOW — Sunburst: dense radial composition. 24 rays, an inner-ring of
// short rays, an outer ring of dots, and a central medallion with detail.
function Sunburst({ accent }) {
  const cx = 50;
  const cy = 70;

  // Long rays (24 of them, every 15°)
  const longRays = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i * 15 * Math.PI) / 180;
    const r1 = 14;
    const r2 = i % 2 === 0 ? 56 : 48; // alternating long/medium
    longRays.push(
      <Line
        key={`lr${i}`}
        x1={cx + r1 * Math.cos(angle)}
        y1={cy + r1 * Math.sin(angle)}
        x2={cx + r2 * Math.cos(angle)}
        y2={cy + r2 * Math.sin(angle)}
        stroke={accent}
        strokeWidth={i % 2 === 0 ? 1.8 : 1.2}
        strokeLinecap="round"
        opacity={i % 2 === 0 ? 0.95 : 0.7}
      />
    );
  }

  // Outer ring of dots
  const dots = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i * 15 * Math.PI) / 180 + (7.5 * Math.PI) / 180;
    const r = 60;
    dots.push(
      <Circle
        key={`d${i}`}
        cx={cx + r * Math.cos(angle)}
        cy={cy + r * Math.sin(angle)}
        r="0.9"
        fill={accent}
        opacity="0.65"
      />
    );
  }

  return (
    <G>
      <InnerFrame accent={accent} />
      {longRays}
      {dots}
      {/* Central medallion with detail */}
      <Circle cx={cx} cy={cy} r="11" fill={accent} opacity="0.95" />
      <Circle cx={cx} cy={cy} r="6" fill={COLORS.yellow.bg} opacity="0.9" />
      <Circle cx={cx} cy={cy} r="2.5" fill={accent} />
    </G>
  );
}

// PURPLE — Deco: dense lozenge grid with diamond-in-diamond detail. Connecting
// lines between rows make it read as a continuous trellis, not isolated shapes.
function Deco({ accent }) {
  const cols = [20, 40, 60, 80];
  const rows = [22, 46, 70, 94, 118];
  const half = 7;
  const innerHalf = 3;
  const elements = [];

  rows.forEach((cy, ri) => {
    cols.forEach((cx, ci) => {
      // Outer diamond
      elements.push(
        <Path
          key={`d${ri}-${ci}`}
          d={`M ${cx} ${cy - half} L ${cx + half} ${cy} L ${cx} ${cy + half} L ${cx - half} ${cy} Z`}
          stroke={accent}
          strokeWidth="1"
          fill="none"
          opacity="0.9"
        />
      );
      // Inner filled diamond
      elements.push(
        <Path
          key={`di${ri}-${ci}`}
          d={`M ${cx} ${cy - innerHalf} L ${cx + innerHalf} ${cy} L ${cx} ${cy + innerHalf} L ${cx - innerHalf} ${cy} Z`}
          fill={accent}
          opacity="0.6"
          stroke="none"
        />
      );
    });
  });

  // Connecting lines between adjacent diamond tips (horizontal)
  rows.forEach((cy, ri) => {
    for (let ci = 0; ci < cols.length - 1; ci++) {
      elements.push(
        <Line
          key={`lh${ri}-${ci}`}
          x1={cols[ci] + half}
          y1={cy}
          x2={cols[ci + 1] - half}
          y2={cy}
          stroke={accent}
          strokeWidth="0.8"
          opacity="0.4"
        />
      );
    }
  });

  return (
    <G>
      <InnerFrame accent={accent} />
      {elements}
    </G>
  );
}

// BLACK — Labyrinth: Greek key meander running as a frame just inside the
// inner border, plus a central square cartouche with cross detail. Reads as
// classical / monumental rather than a single zigzag line.
function Labyrinth({ accent }) {
  // Border meander as a single path tracing all four sides. Each unit is a
  // small Greek-key hook. We approximate with right-angle steps.
  // Top edge: left → right with hooks dropping into card
  // Right edge: top → bottom
  // Bottom edge: right → left
  // Left edge: bottom → top
  // This is hand-tuned for the 100x140 viewBox.
  const meander = [
    // Top
    'M 12 14 L 12 22 L 20 22 L 20 14 L 28 14 L 28 22 L 36 22 L 36 14 L 44 14 L 44 22 L 52 22 L 52 14 L 60 14 L 60 22 L 68 22 L 68 14 L 76 14 L 76 22 L 84 22 L 84 14',
    // Right
    'M 86 12 L 78 12 L 78 20 L 86 20 L 86 28 L 78 28 L 78 36 L 86 36 L 86 44 L 78 44 L 78 52 L 86 52 L 86 60 L 78 60 L 78 68 L 86 68 L 86 76 L 78 76 L 78 84 L 86 84 L 86 92 L 78 92 L 78 100 L 86 100 L 86 108 L 78 108 L 78 116 L 86 116 L 86 124 L 78 124 L 78 128',
    // Bottom
    'M 88 126 L 88 118 L 80 118 L 80 126 L 72 126 L 72 118 L 64 118 L 64 126 L 56 126 L 56 118 L 48 118 L 48 126 L 40 126 L 40 118 L 32 118 L 32 126 L 24 126 L 24 118 L 16 118 L 16 126',
    // Left
    'M 14 128 L 22 128 L 22 120 L 14 120 L 14 112 L 22 112 L 22 104 L 14 104 L 14 96 L 22 96 L 22 88 L 14 88 L 14 80 L 22 80 L 22 72 L 14 72 L 14 64 L 22 64 L 22 56 L 14 56 L 14 48 L 22 48 L 22 40 L 14 40 L 14 32 L 22 32 L 22 24 L 14 24 L 14 16',
  ];

  return (
    <G stroke={accent} fill="none" strokeWidth="1.2" strokeLinejoin="miter">
      <InnerFrame accent={accent} opacity={0.4} />
      {meander.map((d, i) => (
        <Path key={i} d={d} opacity="0.85" />
      ))}
      {/* Two stacked cartouches centered vertically. Eliminates the dead
          middle and gives the meander border two focal anchors instead of
          one. Each has an inner square + cross detail. */}
      {/* Upper cartouche */}
      <Rect
        x="36"
        y="40"
        width="28"
        height="22"
        stroke={accent}
        strokeWidth="1.2"
        fill="none"
        opacity="0.9"
      />
      <Rect
        x="40"
        y="44"
        width="20"
        height="14"
        stroke={accent}
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      <Line x1="50" y1="44" x2="50" y2="58" stroke={accent} strokeWidth="0.8" opacity="0.6" />
      <Line x1="40" y1="51" x2="60" y2="51" stroke={accent} strokeWidth="0.8" opacity="0.6" />

      {/* Connecting beads between cartouches */}
      <Circle cx="50" cy="66" r="1.3" fill={accent} opacity="0.7" />
      <Circle cx="50" cy="70" r="1" fill={accent} opacity="0.55" />
      <Circle cx="50" cy="74" r="1.3" fill={accent} opacity="0.7" />

      {/* Lower cartouche */}
      <Rect
        x="36"
        y="78"
        width="28"
        height="22"
        stroke={accent}
        strokeWidth="1.2"
        fill="none"
        opacity="0.9"
      />
      <Rect
        x="40"
        y="82"
        width="20"
        height="14"
        stroke={accent}
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      <Line x1="50" y1="82" x2="50" y2="96" stroke={accent} strokeWidth="0.8" opacity="0.6" />
      <Line x1="40" y1="89" x2="60" y2="89" stroke={accent} strokeWidth="0.8" opacity="0.6" />
    </G>
  );
}

const PATTERNS = {
  blue: Wave,
  red: Chevron,
  green: Vine,
  yellow: Sunburst,
  purple: Deco,
  black: Labyrinth,
};

// --- Component -------------------------------------------------------------

function CardBack({ size, color = 'blue' }) {
  const colors = COLORS[color] || COLORS.blue;
  const Pattern = PATTERNS[color] || Wave;
  const height = size * 1.4;

  return (
    <View
      style={{
        width: size,
        height: height,
        backgroundColor: colors.bg,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid meet"
      >
        <Pattern accent={colors.accent} />
      </Svg>
    </View>
  );
}

// React.memo: 16+ cards on screen, each re-rendering on every flip is
// expensive. Memo skips re-renders when size and color haven't changed.
export default React.memo(CardBack);
