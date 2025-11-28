import React, { useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Group } from 'react-konva';
import { toGridCoordinates, toRowName, toColumnName } from '../../utils/coordinateConverter';
import { eletrocalhasService } from '../../api/eletrocalhasService'; // Import the service

const Theme = {
  colors: {
    gridLine: '#F1F3F5', rackEmpty: '#F8F9FA', rackBorder: '#DEE2E6', rackText: '#ADB5BD',
    statusFull: '#DC3545', statusPartial: '#FFC107', statusAvailable: '#28A745',
    calha: '#6C757D', dot: '#FFC107',
    rackCC: '#6A1B9A', // A distinct color for Cross Connect Racks (e.g., a shade of purple)
    eletrocalhaGreen: '#22c55e', // Tailwind green-500
    eletrocalhaYellow: '#eab308', // Tailwind yellow-500
    eletrocalhaRed: '#ef4444', // Tailwind red-500
    drawingPoint: '#007bff', // Blue color for drawing points
    drawingLine: '#007bff',
    eletrocalhaPreview: '#ced4da' // Grey color for preview lines
  },
  dims: { gridSize: 40, rackGap: 4, rackRadius: 4 }
};

export const gridSize = Theme.dims.gridSize;
export const mapWidth = 1200;
export const mapHeight = 800;

const PADDING = 80;

const DataHallMap = ({ racks = [], eletrocalhas = [], width, height, project, session, stageState, onWheel, onDragEnd, onRackClick, onEletrocalhaClick, previewEletrocalhas = [], originRackId, destinationRackId, plannedRoute, showRoutes }) => {
  const projectWidth = project.largura_mm;
  const projectHeight = project.altura_mm;

  const realWorldGridUnit = 600; // 1 bloco = 600mm
  const cols = projectWidth / realWorldGridUnit;
  const rows = projectHeight / realWorldGridUnit;

  const displayWidth = projectWidth / realWorldGridUnit * gridSize + PADDING * 2;
  const displayHeight = projectHeight / realWorldGridUnit * gridSize + PADDING * 2;
  
  const handleEletrocalhaEvents = (calha, eventType, cursor = 'default', event) => {
    const stage = event.target.getStage();
    if (stage) {
      stage.container().style.cursor = cursor;
    }
    if (eventType === 'click') {
      onEletrocalhaClick(calha);
    }
  };

  const overlapDots = useMemo(() => {
    const rackCoords = new Set(racks.map(r => `${r.coordenada_x},${r.coordenada_y}`));
    const overlapCoordsSet = new Set();

    for (const calha of eletrocalhas) {
      const x1 = calha.ponto_a_x; const y1 = calha.ponto_a_y;
      const x2 = calha.ponto_b_x; const y2 = calha.ponto_b_y;
      if (x1 === undefined) continue;

      if (x1 === x2) { // Vertical Eletrocalha
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          if (rackCoords.has(`${x1},${y}`)) overlapCoordsSet.add(`${x1},${y}`);
        }
      } else if (y1 === y2) { // Horizontal Eletrocalha
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          if (rackCoords.has(`${x},${y1}`)) overlapCoordsSet.add(`${x},${y1}`);
        }
      }
    }
    
    return Array.from(overlapCoordsSet).map(coordStr => {
      const [x, y] = coordStr.split(',').map(Number);
      return { key: `dot-${x}-${y}`, x: (x - 0.5) * gridSize, y: (y - 0.5) * gridSize };
    });
  }, [racks, eletrocalhas]);

  const renderEmptySlots = () => {
    const slots = [];
    const occupied = new Set(racks.map(r => `${r.coordenada_x},${r.coordenada_y}`));
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const dbX = i + 1;
        const dbY = j + 1;

        if (occupied.has(`${dbX},${dbY}`)) continue;
        
        const { rowName, colName } = toGridCoordinates(dbX * realWorldGridUnit, dbY * realWorldGridUnit, realWorldGridUnit);
        slots.push(
          <Group key={`slot-${dbX}-${dbY}`} x={i * gridSize + PADDING} y={j * gridSize + PADDING}>
            <Rect x={Theme.dims.rackGap/2} y={Theme.dims.rackGap/2} width={gridSize-Theme.dims.rackGap} height={gridSize-Theme.dims.rackGap} fill={Theme.colors.rackEmpty} stroke={Theme.colors.rackBorder} strokeWidth={1} cornerRadius={Theme.dims.rackRadius} />
            <Text text={`${rowName}${colName}`} width={gridSize} height={gridSize} align="center" verticalAlign="middle" fontSize={10} fill={Theme.colors.rackText} />
          </Group>
        );
      }
    }
    return slots;
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
      draggable={true}
      pixelRatio={window.devicePixelRatio || 1}
    >
      <Layer>
        {/* Render column names */}
        {[...Array(Math.floor(cols)).keys()].map(i => (
          <Text
            key={`col-label-${i}`}
            x={(i * gridSize) + PADDING + gridSize / 2}
            y={PADDING / 2 - 10}
            text={toColumnName(i)}
            fontSize={10}
            fill="#6C757D"
            align="center"
            verticalAlign="middle"
            width={gridSize}
          />
        ))}

        {/* Render row names */}
        {[...Array(Math.floor(rows)).keys()].map(j => (
          <Text
            key={`row-label-${j}`}
            x={PADDING / 2 - 10}
            y={(j * gridSize) + PADDING + gridSize / 2}
            text={toRowName(j)}
            fontSize={10}
            fill="#6C757D"
            align="right"
            verticalAlign="middle"
            width={gridSize/2}
          />
        ))}

        {renderEmptySlots()}

        {racks.map(rack => {
          const renderX = (rack.coordenada_x - 1);
          const renderY = (rack.coordenada_y - 1);
          const xPos = renderX * gridSize + PADDING;
          const yPos = renderY * gridSize + PADDING;

          if (xPos < 0) return null;

          const { rowName, colName } = toGridCoordinates(rack.coordenada_x * realWorldGridUnit, rack.coordenada_y * realWorldGridUnit, realWorldGridUnit);
          const rackName = `${rowName}${colName}`;
          
          let fill;
          let occupancyText;
          let stroke = 'transparent';
          let strokeWidth = 0;

          if (rack.id === parseInt(originRackId)) {
            stroke = '#007bff'; // Blue for origin
            strokeWidth = 3;
          } else if (rack.id === parseInt(destinationRackId)) {
            stroke = '#28a745'; // Green for destination
            strokeWidth = 3;
          }

          if (rack.is_cross_connect) {
            fill = Theme.colors.rackCC;
            occupancyText = "CC";
          } else {
            const occupancyPercentage = rack.capacidade_u > 0 ? (rack.ocupado_u / rack.capacidade_u) : 0;
            if (occupancyPercentage === 1) {
              fill = Theme.colors.statusFull;
            } else if (occupancyPercentage > 0) {
              fill = Theme.colors.statusPartial;
            } else {
              fill = Theme.colors.statusAvailable;
            }
            occupancyText = `${rack.ocupado_u}U/${rack.capacidade_u}U`;
          }

          return (
            <Group 
              key={`rack-${rack.id}`} 
              x={xPos} 
              y={yPos}
              onClick={() => onRackClick(rack)}
              onTap={() => onRackClick(rack)}
              onMouseEnter={e => { e.target.getStage().container().style.cursor = 'pointer'; }}
              onMouseLeave={e => { e.target.getStage().container().style.cursor = 'default'; }}
            >
              <Rect 
                x={Theme.dims.rackGap/2} 
                y={Theme.dims.rackGap/2} 
                width={gridSize-Theme.dims.rackGap} 
                height={gridSize-Theme.dims.rackGap} 
                fill={fill} 
                cornerRadius={Theme.dims.rackRadius} 
                shadowColor="black" 
                shadowBlur={2} 
                shadowOpacity={0.2} 
                shadowOffset={{ x: 1, y: 1 }}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
              <Text text={rackName} width={gridSize} height={gridSize/2} align="center" verticalAlign="middle" fontSize={9} fontStyle="bold" fill="#FFF" />
              <Text text={occupancyText} width={gridSize} y={gridSize/2} height={gridSize/2} align="center" verticalAlign="middle" fontSize={7} fill="rgba(255,255,255,0.8)" />
            </Group>
          );
        })}

        {eletrocalhas.map(calha => {
          const x1 = (calha.ponto_a_x - 1) * gridSize + PADDING;
          const y1 = (calha.ponto_a_y - 1) * gridSize + PADDING;
          const x2 = (calha.ponto_b_x - 1) * gridSize + PADDING;
          const y2 = (calha.ponto_b_y - 1) * gridSize + PADDING;

          let strokeColor;
          const occupancyPercentage = calha.capacidade_maxima > 0 ? (calha.ocupacao_atual / calha.capacidade_maxima) : 0;
          if (occupancyPercentage <= 0.5) {
            strokeColor = Theme.colors.eletrocalhaGreen;
          } else if (occupancyPercentage <= 0.8) {
            strokeColor = Theme.colors.eletrocalhaYellow;
          } else {
            strokeColor = Theme.colors.eletrocalhaRed;
          }

          return (
            <Line
              key={`calha-${calha.id}`}
              points={[x1 + gridSize / 2, y1 + gridSize / 2, x2 + gridSize / 2, y2 + gridSize / 2]}
              stroke={strokeColor}
              strokeWidth={8} // Aumenta a área de clique
              lineCap="round"
              opacity={0.7}
              onClick={(e) => handleEletrocalhaEvents(calha, 'click', 'pointer', e)}
              onTap={(e) => handleEletrocalhaEvents(calha, 'click', 'pointer', e)}
              onMouseEnter={(e) => handleEletrocalhaEvents(calha, 'mouseenter', 'pointer', e)}
              onMouseLeave={(e) => handleEletrocalhaEvents(calha, 'mouseleave', 'default', e)}
            />
          );
        })}

        {overlapDots.map(dot => <Circle key={dot.key} x={dot.x + PADDING} y={dot.y + PADDING} radius={4} fill={Theme.colors.dot} stroke="#fff" strokeWidth={1} />)}
        
        {/* Render preview eletrocalhas */}
        {previewEletrocalhas.map(calha => {
          const x1 = (calha.ponto_a_x - 1) * gridSize + PADDING;
          const y1 = (calha.ponto_a_y - 1) * gridSize + PADDING;
          const x2 = (calha.ponto_b_x - 1) * gridSize + PADDING;
          const y2 = (calha.ponto_b_y - 1) * gridSize + PADDING;

          return <Line key={`preview-calha-${calha.id || calha.ponto_a_x + '-' + calha.ponto_a_y + '-' + calha.ponto_b_x + '-' + calha.ponto_b_y}`} points={[x1+gridSize/2, y1+gridSize/2, x2+gridSize/2, y2+gridSize/2]} stroke={Theme.colors.eletrocalhaPreview} strokeWidth={6} lineCap="round" dash={[10, 5]} opacity={0.6} />;
        })}

        {/* Render the planned route */}
        {showRoutes && plannedRoute && plannedRoute.map((calha, index) => {
          const x1 = (calha.ponto_a_x - 1) * gridSize + PADDING + gridSize / 2;
          const y1 = (calha.ponto_a_y - 1) * gridSize + PADDING + gridSize / 2;
          const x2 = (calha.ponto_b_x - 1) * gridSize + PADDING + gridSize / 2;
          const y2 = (calha.ponto_b_y - 1) * gridSize + PADDING + gridSize / 2;

          return (
            <Line
              key={`route-segment-${index}`}
              points={[x1, y1, x2, y2]}
              stroke="#3b82f6" // Blue-500
              strokeWidth={5}
              lineCap="round"
              opacity={0.8}
              dash={[15, 5]}
              shadowColor="#3b82f6"
              shadowBlur={10}
              shadowOpacity={0.9}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};


export default DataHallMap;
