import React, { useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Furniture item interface from 2D data
interface FurnitureItem {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  style?: string;
}

// Update the furniture props to include more specific shape information
const furnitureProps: Record<string, {
  height: number,
  geometry: 'box' | 'cylinder' | 'plane' | 'composite',
  color: string,
  parts?: Array<{
    type: 'box' | 'cylinder' | 'plane',
    position: [number, number, number], // relative position [x, y, z]
    size: [number, number, number], // width, height, depth or similar
    color?: string,
    rotation?: [number, number, number]
  }>
}> = {
  bed: { 
    height: 0.5, 
    geometry: 'composite', 
    color: '#9CB4CC',
    parts: [
      // Mattress
      { type: 'box', position: [0, 0.25, 0], size: [1, 0.2, 1] },
      // Base/frame
      { type: 'box', position: [0, 0, 0], size: [1.05, 0.3, 1.05], color: '#7A8EA6' },
      // Headboard
      { type: 'box', position: [0, 0.5, -0.45], size: [1, 0.5, 0.1], color: '#7A8EA6' }
    ]
  },
  desk: { 
    height: 0.8, 
    geometry: 'composite', 
    color: '#A1C7E0',
    parts: [
      // Tabletop
      { type: 'box', position: [0, 0.4, 0], size: [1, 0.05, 0.6], color: '#A1C7E0' },
      // Legs - each corner
      { type: 'box', position: [0.45, 0.2, 0.25], size: [0.05, 0.4, 0.05], color: '#81A7C0' },
      { type: 'box', position: [-0.45, 0.2, 0.25], size: [0.05, 0.4, 0.05], color: '#81A7C0' },
      { type: 'box', position: [0.45, 0.2, -0.25], size: [0.05, 0.4, 0.05], color: '#81A7C0' },
      { type: 'box', position: [-0.45, 0.2, -0.25], size: [0.05, 0.4, 0.05], color: '#81A7C0' }
    ]
  },
  chair: { 
    height: 1.0, 
    geometry: 'composite', 
    color: '#B6CFDA',
    parts: [
      // Seat
      { type: 'box', position: [0, 0.45, 0], size: [0.5, 0.05, 0.5], color: '#B6CFDA' },
      // Backrest
      { type: 'box', position: [0, 0.75, -0.225], size: [0.48, 0.6, 0.05], color: '#B6CFDA' },
      // Legs
      { type: 'box', position: [0.2, 0.225, 0.2], size: [0.05, 0.45, 0.05], color: '#96AFBA' },
      { type: 'box', position: [-0.2, 0.225, 0.2], size: [0.05, 0.45, 0.05], color: '#96AFBA' },
      { type: 'box', position: [0.2, 0.225, -0.2], size: [0.05, 0.45, 0.05], color: '#96AFBA' },
      { type: 'box', position: [-0.2, 0.225, -0.2], size: [0.05, 0.45, 0.05], color: '#96AFBA' }
    ]
  },
  sofa: { 
    height: 0.9, 
    geometry: 'composite', 
    color: '#D2E0FB',
    parts: [
      // Base
      { type: 'box', position: [0, 0.2, 0], size: [1, 0.4, 0.8], color: '#D2E0FB' },
      // Backrest
      { type: 'box', position: [0, 0.6, -0.35], size: [0.95, 0.4, 0.1], color: '#D2E0FB' },
      // Armrests
      { type: 'box', position: [0.475, 0.4, 0], size: [0.05, 0.2, 0.75], color: '#B2C0DB' },
      { type: 'box', position: [-0.475, 0.4, 0], size: [0.05, 0.2, 0.75], color: '#B2C0DB' },
      // Cushions
      { type: 'box', position: [0, 0.45, 0.1], size: [0.9, 0.1, 0.5], color: '#E2F0FF' }
    ]
  },
  table: { 
    height: 0.7, 
    geometry: 'composite', 
    color: '#CADCFC',
    parts: [
      // Tabletop
      { type: 'box', position: [0, 0.35, 0], size: [1, 0.05, 1], color: '#CADCFC' },
      // Legs
      { type: 'box', position: [0.45, 0.175, 0.45], size: [0.05, 0.35, 0.05], color: '#AABCDC' },
      { type: 'box', position: [-0.45, 0.175, 0.45], size: [0.05, 0.35, 0.05], color: '#AABCDC' },
      { type: 'box', position: [0.45, 0.175, -0.45], size: [0.05, 0.35, 0.05], color: '#AABCDC' },
      { type: 'box', position: [-0.45, 0.175, -0.45], size: [0.05, 0.35, 0.05], color: '#AABCDC' }
    ]
  },
  dresser: { 
    height: 1.0, 
    geometry: 'composite', 
    color: '#C3D5E8',
    parts: [
      // Main body
      { type: 'box', position: [0, 0.5, 0], size: [1, 1, 0.5], color: '#C3D5E8' },
      // Drawer handles - top row
      { type: 'box', position: [0.25, 0.75, 0.26], size: [0.1, 0.02, 0.02], color: '#A3B5C8' },
      { type: 'box', position: [-0.25, 0.75, 0.26], size: [0.1, 0.02, 0.02], color: '#A3B5C8' },
      // Drawer handles - middle row
      { type: 'box', position: [0.25, 0.5, 0.26], size: [0.1, 0.02, 0.02], color: '#A3B5C8' },
      { type: 'box', position: [-0.25, 0.5, 0.26], size: [0.1, 0.02, 0.02], color: '#A3B5C8' },
      // Drawer handles - bottom row
      { type: 'box', position: [0.25, 0.25, 0.26], size: [0.1, 0.02, 0.02], color: '#A3B5C8' },
      { type: 'box', position: [-0.25, 0.25, 0.26], size: [0.1, 0.02, 0.02], color: '#A3B5C8' }
    ]
  },
  tv: { 
    height: 0.8, 
    geometry: 'composite', 
    color: '#A1B5D8',
    parts: [
      // Screen
      { type: 'box', position: [0, 0.4, 0], size: [1.2, 0.7, 0.1], color: '#A1B5D8' },
      // Stand
      { type: 'box', position: [0, 0.05, 0], size: [0.4, 0.1, 0.3], color: '#818DA8' }
    ]
  },
  lamp: { 
    height: 1.5, 
    geometry: 'composite', 
    color: '#F0F5FA',
    parts: [
      // Lampshade
      { type: 'cylinder', position: [0, 1.3, 0], size: [0.2, 0.2, 0.4], color: '#F0F5FA' },
      // Stem
      { type: 'cylinder', position: [0, 0.7, 0], size: [0.03, 0.03, 1.4], color: '#D0D5DA' },
      // Base
      { type: 'cylinder', position: [0, 0.05, 0], size: [0.25, 0.25, 0.1], color: '#C0C5CA' }
    ]
  },
  nightstand: { 
    height: 0.6, 
    geometry: 'composite', 
    color: '#DAE4F2',
    parts: [
      // Main body
      { type: 'box', position: [0, 0.3, 0], size: [0.5, 0.6, 0.5], color: '#DAE4F2' },
      // Drawer handle
      { type: 'box', position: [0, 0.4, 0.26], size: [0.2, 0.02, 0.02], color: '#BAC4D2' },
      // Legs
      { type: 'box', position: [0.2, 0.05, 0.2], size: [0.05, 0.1, 0.05], color: '#BAC4D2' },
      { type: 'box', position: [-0.2, 0.05, 0.2], size: [0.05, 0.1, 0.05], color: '#BAC4D2' },
      { type: 'box', position: [0.2, 0.05, -0.2], size: [0.05, 0.1, 0.05], color: '#BAC4D2' },
      { type: 'box', position: [-0.2, 0.05, -0.2], size: [0.05, 0.1, 0.05], color: '#BAC4D2' }
    ]
  },
  rug: { 
    height: 0.05, 
    geometry: 'plane', 
    color: '#E8EEF8' 
  },
  door: { 
    height: 2.0, 
    geometry: 'composite', 
    color: '#B8C5D6',
    parts: [
      // Door panel
      { type: 'box', position: [0, 1, 0], size: [0.9, 2, 0.05], color: '#B8C5D6' },
      // Door handle
      { type: 'cylinder', position: [0.35, 1, 0.03], size: [0.03, 0.03, 0.1], rotation: [Math.PI/2, 0, 0], color: '#989FA8' }
    ]
  },
  window: { 
    height: 1.2, 
    geometry: 'composite', 
    color: '#D4E3F3',
    parts: [
      // Frame
      { type: 'box', position: [0, 0.6, 0], size: [1, 1.2, 0.1], color: '#B4C3D3' },
      // Glass
      { type: 'box', position: [0, 0.6, 0], size: [0.9, 1.1, 0.05], color: '#D4E3F3', transparency: 0.7 },
      // Window dividers
      { type: 'box', position: [0, 0.6, 0.03], size: [0.03, 1.1, 0.03], color: '#B4C3D3' },
      { type: 'box', position: [0, 0.6, 0.03], size: [0.9, 0.03, 0.03], color: '#B4C3D3' }
    ]
  },
  default: { 
    height: 1.0, 
    geometry: 'box', 
    color: '#C0D0E5' 
  }
};

// Update the FurnitureItem3D component to render composite objects
function FurnitureItem3D({ item, dimensions }: { 
  item: FurnitureItem, 
  dimensions: { width: number, height: number } 
}) {
  // Calculate scaled position
  const scaleX = 10 / dimensions.width;
  const scaleZ = 8 / dimensions.height;
  
  // Convert 2D coordinates to 3D space - maintain the exact center point
  const x = (item.x + item.width/2 - dimensions.width / 2) * scaleX;
  const z = (item.y + item.height/2 - dimensions.height / 2) * scaleZ;
  
  // Get furniture type properties (or default)
  const lowerType = item.type.toLowerCase();
  const props = furnitureProps[lowerType] || furnitureProps.default;
  
  // Calculate scale factors based on the furniture's actual size in 2D
  const width = item.width * scaleX;
  const depth = item.height * scaleZ;
  const height = props.height;
  
  // Calculate the overall scale for composite objects
  // We want the model to match the actual dimensions in the 2D plan
  const scaleFactorX = width;
  const scaleFactorY = 1; // Keep Y scale at 1 (height is controlled by the model)
  const scaleFactorZ = depth;
  
  // Convert rotation from degrees to radians
  const rotation = item.rotation ? (item.rotation * Math.PI / 180) : 0;
  
  // Custom color or default
  const mainColor = item.color || props.color;
  
  if (props.geometry === 'composite' && props.parts) {
    return (
      <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
        {props.parts.map((part, index) => {
          const partColor = part.color || mainColor;
          
          // Scale the part dimensions based on the 2D furniture size
          const scaledPosition: [number, number, number] = [
            part.position[0] * scaleFactorX,
            part.position[1] * scaleFactorY,
            part.position[2] * scaleFactorZ
          ];
          
          const scaledSize: [number, number, number] = [
            part.size[0] * scaleFactorX,
            part.size[1] * scaleFactorY,
            part.size[2] * scaleFactorZ
          ];
          
          if (part.type === 'box') {
            return (
              <mesh 
                key={index} 
                position={scaledPosition} 
                rotation={part.rotation || [0, 0, 0]}
                castShadow 
                receiveShadow
              >
                <boxGeometry args={scaledSize} />
                <meshStandardMaterial 
                  color={partColor} 
                  transparent={part.transparency !== undefined}
                  opacity={part.transparency !== undefined ? part.transparency : 1}
                />
              </mesh>
            );
          } else if (part.type === 'cylinder') {
            // For cylinders, scale the radius and height
            return (
              <mesh 
                key={index} 
                position={scaledPosition} 
                rotation={part.rotation || [0, 0, 0]}
                castShadow 
                receiveShadow
              >
                <cylinderGeometry 
                  args={[
                    scaledSize[0], 
                    scaledSize[1], 
                    scaledSize[2], 
                    32
                  ]} 
                />
                <meshStandardMaterial 
                  color={partColor} 
                  transparent={part.transparency !== undefined}
                  opacity={part.transparency !== undefined ? part.transparency : 1}
                />
              </mesh>
            );
          } else if (part.type === 'plane') {
            return (
              <mesh 
                key={index} 
                position={scaledPosition} 
                rotation={part.rotation || [-Math.PI/2, 0, 0]}
                receiveShadow
              >
                <planeGeometry args={[scaledSize[0], scaledSize[2]]} />
                <meshStandardMaterial 
                  color={partColor} 
                  side={THREE.DoubleSide}
                  transparent={part.transparency !== undefined}
                  opacity={part.transparency !== undefined ? part.transparency : 1}
                />
              </mesh>
            );
          }
          return null;
        })}
      </group>
    );
  }
  
  // Handle non-composite geometries as before
  switch (props.geometry) {
    case 'cylinder':
      return (
        <group position={[x, height/2, z]} rotation={[0, rotation, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[width/3, width/3, height, 32]} />
            <meshStandardMaterial color={mainColor} />
          </mesh>
          {lowerType === 'lamp' && (
            <mesh position={[0, -height/2 + 0.05, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[width/2, width/2, 0.1, 32]} />
              <meshStandardMaterial color={mainColor} />
            </mesh>
          )}
        </group>
      );
    
    case 'plane':
      return (
        <mesh 
          position={[x, 0.025, z]} 
          rotation={[-Math.PI/2, 0, rotation]} 
          receiveShadow
        >
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={mainColor} side={THREE.DoubleSide} />
        </mesh>
      );
    
    case 'box':
    default:
      return (
        <group position={[x, height/2, z]} rotation={[0, rotation, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={mainColor} />
          </mesh>
        </group>
      );
  }
}

// Room walls and floor
function RoomStructure({ dimensions }: { dimensions: { width: number, height: number } }) {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
      
      {/* Optional: Add walls */}
      <mesh position={[0, 1, -5]} castShadow receiveShadow>
        <boxGeometry args={[12, 2, 0.1]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      
      <mesh position={[0, 1, 5]} castShadow receiveShadow>
        <boxGeometry args={[12, 2, 0.1]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      
      <mesh position={[6, 1, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 2, 0.1]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      
      <mesh position={[-6, 1, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 2, 0.1]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
    </>
  );
}

// Room plan with furniture
function RoomPlan3DScene({ roomState }: { roomState: any }) {
  const { furniture = [], dimensions = { width: 400, height: 300 } } = roomState;
  
  return (
    <>
      <RoomStructure dimensions={dimensions} />
      
      {furniture.map((item: FurnitureItem) => (
        <FurnitureItem3D 
          key={item.id || `item-${item.x}-${item.y}`} 
          item={item} 
          dimensions={dimensions} 
        />
      ))}
    </>
  );
}

// Main component that wraps the 3D scene
export function RoomPlanner3DView({ roomState }: { roomState: any }) {
  return (
    <div className="w-full h-full">
      <Canvas 
        shadows 
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Scene */}
        <RoomPlan3DScene roomState={roomState} />
        
        {/* Environment and controls */}
        <Environment preset="apartment" background />
        <OrbitControls 
          target={[0, 0, 0]} 
          maxPolarAngle={Math.PI / 2} 
          enableDamping 
          dampingFactor={0.05} 
        />
      </Canvas>
    </div>
  );
}