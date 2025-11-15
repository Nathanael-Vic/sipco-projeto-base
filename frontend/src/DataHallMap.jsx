import React, { useMemo } from 'react';
import { Stage, Layer, Rect, Line, Circle } from 'react-konva';

const CoresTema = {
  BB_BLUE: '#004A8F',
  GRID_LINE: '#DDDDDD',
  CALHA: '#AAAAAA',
  BORDER: '#CCCCCC',
  OVERLAP_DOT: '#FFEC00', 
};

export const gridSize = 40; 
export const mapWidth = 1200; 
export const mapHeight = 800;

const generateXCoords = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const coords = [];
  for (let i = 0; i < alphabet.length; i++) {
    coords.push(alphabet[i]);
  }
  for (let i = 0; i < 2; i++) { 
    for (let j = 0; j < alphabet.length; j++) {
      coords.push(alphabet[i] + alphabet[j]);
    }
  }
  return coords.slice(0, mapWidth / gridSize); 
};
export const xCoords = generateXCoords();

const xCoordMap = new Map(xCoords.map((letter, i) => [letter, i]));

const getX = (letter) => xCoordMap.get(letter);
const getY = (number) => number - 1; 

const DataHallMap = ({ 
  racks = [], 
  eletrocalhas = [],
  width, height, stageState,
  onWheel, onDragEnd, dragBoundFunc
}) => {

  const overlapDots = useMemo(() => {
    const rackCoords = new Set(
      racks.map(r => `${r.coordenada_x},${r.coordenada_y}`)
    );
    const dots = [];

    for (const calha of eletrocalhas) {
      if (!calha.ponto_a_x || !calha.ponto_a_y || !calha.ponto_b_x || !calha.ponto_b_y) continue;
      
      const x1 = getX(calha.ponto_a_x);
      const y1 = getY(calha.ponto_a_y);
      const x2 = getX(calha.ponto_b_x);
      const y2 = getY(calha.ponto_b_y);

      if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) continue;

      if (x1 === x2) { 
        const xLetter = calha.ponto_a_x;
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          const yNum = y + 1; 
          if (rackCoords.has(`${xLetter},${yNum}`)) {
            dots.push({
              id: `dot-${xLetter}-${yNum}`,
              x: (x1 + 0.5) * gridSize, 
              y: (y + 0.5) * gridSize,  
            });
          }
        }
      } 
      else if (y1 === y2) { 
        const yNum = calha.ponto_a_y;
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          const xLetter = xCoords[x];
          if (rackCoords.has(`${xLetter},${yNum}`)) {
            dots.push({
              id: `dot-${xLetter}-${yNum}`,
              x: (x + 0.5) * gridSize, 
              y: (y1 + 0.5) * gridSize,
            });
          }
        }
      }
    }
    return dots;
  }, [racks, eletrocalhas]);

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= mapWidth / gridSize; i++) {
      lines.push(
        <Line key={`grid-v-${i}`} points={[i * gridSize, 0, i * gridSize, mapHeight]} stroke={CoresTema.GRID_LINE} strokeWidth={1} />
      );
    }
    for (let j = 0; j <= mapHeight / gridSize; j++) {
      lines.push(
        <Line key={`grid-h-${j}`} points={[0, j * gridSize, mapWidth, j * gridSize]} stroke={CoresTema.GRID_LINE} strokeWidth={1} />
      );
    }
    return lines;
  };

  return (
    <Stage 
      width={width}
      height={height}
      style={{ backgroundColor: '#FFFFFF' }}
      scaleX={stageState.scale}
      scaleY={stageState.scale}
      x={stageState.x}
      y={stageState.y}
      onWheel={onWheel} 
      onDragEnd={onDragEnd} 
      draggable={stageState.scale > 1} 
      dragBoundFunc={dragBoundFunc} 
      
      pixelRatio={window.devicePixelRatio || 1}
    >
      <Layer>
        {renderGrid()}
        
        {racks.map(rack => {
          const xPos = getX(rack.coordenada_x);
          const yPos = getY(rack.coordenada_y);
          if (xPos === undefined || yPos === undefined) return null;

          return (
            <Rect
              key={`rack-${rack.id}`}
              x={xPos * gridSize} 
              y={yPos * gridSize} 
              width={gridSize}
              height={gridSize}
              fill={CoresTema.BB_BLUE}
              stroke="#333"
              strokeWidth={1}
            />
          );
        })}

        {eletrocalhas.map(calha => {
          const x1 = getX(calha.ponto_a_x);
          const y1 = getY(calha.ponto_a_y);
          const x2 = getX(calha.ponto_b_x);
          const y2 = getY(calha.ponto_b_y);
          if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;

          return (
            <Line
              key={`calha-${calha.id}`}
              points={[
                (x1 + 0.5) * gridSize, 
                (y1 + 0.5) * gridSize, 
                (x2 + 0.5) * gridSize, 
                (y2 + 0.5) * gridSize  
              ]}
              stroke={CoresTema.CALHA}
              strokeWidth={10}
              lineCap="round"
            />
          );
        })}

        {overlapDots.map(dot => (
          <Circle
            key={dot.id}
            x={dot.x}
            y={dot.y}
            radius={8}
            fill={CoresTema.OVERLAP_DOT}
            stroke="#333"
            strokeWidth={1}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default DataHallMap;