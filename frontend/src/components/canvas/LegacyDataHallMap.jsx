import React, { useMemo } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Group } from 'react-konva';

const Theme = {
  colors: {
    gridLine: '#F1F3F5',    
    rackEmpty: '#F8F9FA',   
    rackBorder: '#DEE2E6',  
    rackText: '#ADB5BD',    
    statusFull: '#DC3545',     
    statusPartial: '#FFC107',  
    statusAvailable: '#28A745',
    calha: '#6C757D',
    dot: '#FFC107'
  },
  dims: {
    gridSize: 40,
    rackGap: 4,    
    rackRadius: 4  
  }
};

export const gridSize = Theme.dims.gridSize;
export const mapWidth = 1200; // Fallback
export const mapHeight = 800; // Fallback

const DataHallMap = ({ racks = [], eletrocalhas = [], width, height, projectWidth, projectHeight, stageState, onWheel, onDragEnd }) => {

  const cols = projectWidth / gridSize;
  const rows = projectHeight / gridSize;

  const overlapDots = useMemo(() => {
    const rackCoords = new Set(racks.map(r => `${r.coordenada_x},${r.coordenada_y}`));
    const dots = [];
    for (const calha of eletrocalhas) {
      const x1 = calha.ponto_a_x; const y1 = calha.ponto_a_y;
      const x2 = calha.ponto_b_x; const y2 = calha.ponto_b_y;
      if (x1 === undefined) continue;
      if (x1 === x2) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          if (rackCoords.has(`${x1},${y}`)) dots.push({ key: `dot-${x1}-${y}`, x: (x1 - 0.5) * gridSize, y: (y - 0.5) * gridSize });
        }
      } else if (y1 === y2) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          if (rackCoords.has(`${x},${y1}`)) dots.push({ key: `dot-${x}-${y1}`, x: (x - 0.5) * gridSize, y: (y1 - 0.5) * gridSize });
        }
      }
    }
    return dots;
  }, [racks, eletrocalhas]);

  const renderEmptySlots = () => {
    const slots = [];
    const occupied = new Set(racks.map(r => `${r.coordenada_x},${r.coordenada_y}`));
    for (let i = 1; i <= cols; i++) {
      for (let j = 1; j <= rows; j++) {
        if (occupied.has(`${i},${j}`)) continue;
        slots.push(
          <Group key={`slot-${i}-${j}`} x={(i-1) * gridSize} y={(j-1) * gridSize}>
            <Rect x={Theme.dims.rackGap/2} y={Theme.dims.rackGap/2} width={gridSize-Theme.dims.rackGap} height={gridSize-Theme.dims.rackGap} fill={Theme.colors.rackEmpty} stroke={Theme.colors.rackBorder} strokeWidth={1} cornerRadius={Theme.dims.rackRadius} />
            <Text text={`${i},${j}`} width={gridSize} height={gridSize} align="center" verticalAlign="middle" fontSize={10} fill={Theme.colors.rackText} />
          </Group>
        );
      }
    }
    return slots;
  };

  return (
    <Stage width={width} height={height} style={{ backgroundColor: '#FFFFFF', cursor: 'grab' }} scaleX={stageState.scale} scaleY={stageState.scale} x={stageState.x} y={stageState.y} onWheel={onWheel} onDragEnd={onDragEnd} draggable={true} pixelRatio={window.devicePixelRatio || 1}>
      <Layer>
        {renderEmptySlots()}
        {racks.map(rack => {
          const xPos = rack.coordenada_x - 1;
          const yPos = rack.coordenada_y - 1;
          if (xPos < 0) return null;
          const isFull = rack.id % 2 === 0;
          return (
            <Group key={`rack-${rack.id}`} x={xPos * gridSize} y={yPos * gridSize}>
              <Rect x={Theme.dims.rackGap/2} y={Theme.dims.rackGap/2} width={gridSize-Theme.dims.rackGap} height={gridSize-Theme.dims.rackGap} fill={isFull ? Theme.colors.statusFull : Theme.colors.statusPartial} cornerRadius={Theme.dims.rackRadius} shadowColor="black" shadowBlur={2} shadowOpacity={0.2} shadowOffset={{ x: 1, y: 1 }} />
              <Text text={rack.nome.replace('Rack-', '')} width={gridSize} height={gridSize} align="center" verticalAlign="middle" fontSize={9} fontStyle="bold" fill="#FFF" />
              <Text text={isFull ? "42U" : "28U"} width={gridSize} y={12} height={gridSize} align="center" verticalAlign="middle" fontSize={7} fill="rgba(255,255,255,0.8)" />
            </Group>
          );
        })}
        {eletrocalhas.map(calha => {
          const x1 = calha.ponto_a_x - 1; const y1 = calha.ponto_a_y - 1;
          const x2 = calha.ponto_b_x - 1; const y2 = calha.ponto_b_y - 1;
          if (x1 < 0) return null;
          return <Line key={`calha-${calha.id}`} points={[(x1+0.5)*gridSize, (y1+0.5)*gridSize, (x2+0.5)*gridSize, (y2+0.5)*gridSize]} stroke={Theme.colors.calha} strokeWidth={6} lineCap="round" opacity={0.7} />;
        })}
        {overlapDots.map(dot => <Circle key={dot.key} x={dot.x} y={dot.y} radius={4} fill={Theme.colors.dot} stroke="#fff" strokeWidth={1} />)}
      </Layer>
    </Stage>
  );
};

export default DataHallMap;