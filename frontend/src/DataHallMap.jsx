import React from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';

const DataHallMap = ({ racks = [], eletrocalhas = [] }) => {
  const gridSize = 40; 
  const mapWidth = 1200; 
  const mapHeight = 800; 

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i < mapWidth / gridSize; i++) {
      lines.push(
        <Line
          key={`grid-v-${i}`}
          points={[i * gridSize, 0, i * gridSize, mapHeight]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }
    for (let j = 0; j < mapHeight / gridSize; j++) {
      lines.push(
        <Line
          key={`grid-h-${j}`}
          points={[0, j * gridSize, mapWidth, j * gridSize]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  return (
    <Stage 
      width={mapWidth} 
      height={mapHeight} 
      style={{ border: '1px solid #ccc' }}
    >
      <Layer>
        {renderGrid()}

        {eletrocalhas.map(calha => (
          <Line
            key={`calha-${calha.id}`}
            points={[
              calha.ponto_a_x * gridSize, calha.ponto_a_y * gridSize,
              calha.ponto_b_x * gridSize, calha.ponto_b_y * gridSize
            ]}
            stroke="#b0b0b0"
            strokeWidth={10} 
            lineCap="round"
          />
        ))}

        {racks.map(rack => (
          <Rect
            key={`rack-${rack.id}`}
            x={rack.coordenada_x * gridSize}
            y={rack.coordenada_y * gridSize}
            width={gridSize}
            height={gridSize}
            fill="#007bff"
            stroke="black"
            strokeWidth={1}
          />
        ))}

      </Layer>
    </Stage>
  );
};

export default DataHallMap;