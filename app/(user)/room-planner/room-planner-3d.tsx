"use client"

import { useEffect, useRef } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Grid, Environment, Text, RoundedBox, Cylinder, Box } from "@react-three/drei"
import { useTheme } from "../../../components/contexts/theme-context"

// Types
interface Vertex {
  x: number
  y: number
}

interface FurniturePiece {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

interface Room {
  wallVertices: Vertex[]
  furniturePieces: FurniturePiece[]
}

interface RoomPlanner3DProps {
  room: Room
}

// Constants
const SCALE_FACTOR = 0.01 // Scale down from pixels to 3D units
const WALL_HEIGHT = 2.5 // Wall height in 3D units
const FURNITURE_HEIGHT_MAP: Record<string, number> = {
  Bed: 0.5,
  Desk: 0.75,
  Nightstand: 0.6,
  Rug: 0.02,
  Dresser: 0.8,
  Chair: 0.9,
  TV: 0.1,
  Lamp: 1.2,
  Door: 2.0,
  Window: 1.5,
  Sofa: 0.8,
  "Coffee Table": 0.45,
  Plant: 1.0,
  Bookshelf: 1.8,
}

// Color map for furniture
const FURNITURE_COLOR_MAP: Record<string, string> = {
  Bed: "#93c5fd", // blue-300
  Desk: "#b45309", // amber-700
  Nightstand: "#d97706", // amber-600
  Rug: "#fbbf24", // amber-400
  Dresser: "#92400e", // amber-800
  Chair: "#d97706", // amber-600
  TV: "#1f2937", // gray-800
  Lamp: "#fcd34d", // amber-300
  Door: "#a16207", // amber-700
  Window: "#7dd3fc", // sky-300
  Sofa: "#60a5fa", // blue-400
  "Coffee Table": "#d97706", // amber-600
  Plant: "#34d399", // emerald-400
  Bookshelf: "#92400e", // amber-800
}

// Wall component
const Walls = ({ vertices }: { vertices: Vertex[] }) => {
  if (vertices.length < 3) return null

  // Create wall segments between each pair of vertices
  return (
    <group>
      {vertices.map((vertex, i) => {
        const nextVertex = vertices[(i + 1) % vertices.length]

        // Calculate wall dimensions and position
        const startX = vertex.x * SCALE_FACTOR
        const startZ = vertex.y * SCALE_FACTOR
        const endX = nextVertex.x * SCALE_FACTOR
        const endZ = nextVertex.y * SCALE_FACTOR

        // Calculate wall length and angle
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2))
        const angle = Math.atan2(endZ - startZ, endX - startX)

        // Calculate wall center position
        const centerX = (startX + endX) / 2
        const centerZ = (startZ + endZ) / 2

        return (
          <mesh key={`wall-${i}`} position={[centerX, WALL_HEIGHT / 2, centerZ]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[length, WALL_HEIGHT, 0.1]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
        )
      })}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f9fafb" />
      </mesh>
    </group>
  )
}

// Enhanced Bed component
const BedModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Bed frame */}
      <RoundedBox args={[width, height * 0.3, depth]} radius={0.05} position={[0, height * 0.15, 0]}>
        <meshStandardMaterial color="#b45309" />
      </RoundedBox>

      {/* Mattress */}
      <RoundedBox args={[width * 0.95, height * 0.2, depth * 0.95]} radius={0.05} position={[0, height * 0.4, 0]}>
        <meshStandardMaterial color="#93c5fd" />
      </RoundedBox>

      {/* Pillows */}
      <RoundedBox
        args={[width * 0.3, height * 0.15, depth * 0.25]}
        radius={0.05}
        position={[-width * 0.3, height * 0.5, -depth * 0.3]}
      >
        <meshStandardMaterial color="#f3f4f6" />
      </RoundedBox>

      <RoundedBox
        args={[width * 0.3, height * 0.15, depth * 0.25]}
        radius={0.05}
        position={[width * 0.3, height * 0.5, -depth * 0.3]}
      >
        <meshStandardMaterial color="#f3f4f6" />
      </RoundedBox>
    </group>
  )
}

// Enhanced Sofa component
const SofaModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Base */}
      <RoundedBox args={[width, height * 0.5, depth]} radius={0.05} position={[0, height * 0.25, 0]}>
        <meshStandardMaterial color="#60a5fa" />
      </RoundedBox>

      {/* Back */}
      <RoundedBox args={[width, height * 0.8, depth * 0.2]} radius={0.05} position={[0, height * 0.65, -depth * 0.4]}>
        <meshStandardMaterial color="#3b82f6" />
      </RoundedBox>

      {/* Armrests */}
      <RoundedBox
        args={[width * 0.1, height * 0.6, depth * 0.8]}
        radius={0.05}
        position={[-width * 0.45, height * 0.3, 0]}
      >
        <meshStandardMaterial color="#3b82f6" />
      </RoundedBox>

      <RoundedBox
        args={[width * 0.1, height * 0.6, depth * 0.8]}
        radius={0.05}
        position={[width * 0.45, height * 0.3, 0]}
      >
        <meshStandardMaterial color="#3b82f6" />
      </RoundedBox>

      {/* Cushions */}
      <RoundedBox
        args={[width * 0.28, height * 0.15, depth * 0.7]}
        radius={0.05}
        position={[-width * 0.3, height * 0.5, depth * 0.1]}
      >
        <meshStandardMaterial color="#60a5fa" />
      </RoundedBox>

      <RoundedBox
        args={[width * 0.28, height * 0.15, depth * 0.7]}
        radius={0.05}
        position={[0, height * 0.5, depth * 0.1]}
      >
        <meshStandardMaterial color="#60a5fa" />
      </RoundedBox>

      <RoundedBox
        args={[width * 0.28, height * 0.15, depth * 0.7]}
        radius={0.05}
        position={[width * 0.3, height * 0.5, depth * 0.1]}
      >
        <meshStandardMaterial color="#60a5fa" />
      </RoundedBox>
    </group>
  )
}

// Enhanced Chair component
const ChairModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Seat */}
      <RoundedBox args={[width, height * 0.1, depth]} radius={0.02} position={[0, height * 0.45, 0]}>
        <meshStandardMaterial color="#d97706" />
      </RoundedBox>

      {/* Back */}
      <RoundedBox args={[width, height * 0.5, depth * 0.1]} radius={0.02} position={[0, height * 0.75, -depth * 0.45]}>
        <meshStandardMaterial color="#b45309" />
      </RoundedBox>

      {/* Legs */}
      <Cylinder
        args={[width * 0.05, width * 0.05, height * 0.45, 8]}
        position={[-width * 0.4, height * 0.225, -depth * 0.4]}
      >
        <meshStandardMaterial color="#92400e" />
      </Cylinder>

      <Cylinder
        args={[width * 0.05, width * 0.05, height * 0.45, 8]}
        position={[width * 0.4, height * 0.225, -depth * 0.4]}
      >
        <meshStandardMaterial color="#92400e" />
      </Cylinder>

      <Cylinder
        args={[width * 0.05, width * 0.05, height * 0.45, 8]}
        position={[-width * 0.4, height * 0.225, depth * 0.4]}
      >
        <meshStandardMaterial color="#92400e" />
      </Cylinder>

      <Cylinder
        args={[width * 0.05, width * 0.05, height * 0.45, 8]}
        position={[width * 0.4, height * 0.225, depth * 0.4]}
      >
        <meshStandardMaterial color="#92400e" />
      </Cylinder>
    </group>
  )
}

// Enhanced Table component
const TableModel = ({ width, depth, height, type }: { width: number; depth: number; height: number; type: string }) => {
  const isDesk = type === "Desk"
  const color = isDesk ? "#b45309" : "#d97706" // Desk or Coffee Table

  return (
    <group>
      {/* Table top */}
      <RoundedBox args={[width, height * 0.1, depth]} radius={0.02} position={[0, height * 0.95, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>

      {/* Legs */}
      {isDesk ? (
        // Desk style legs (two panels)
        <>
          <Box args={[width * 0.1, height * 0.9, depth * 0.8]} position={[-width * 0.4, height * 0.45, 0]}>
            <meshStandardMaterial color="#92400e" />
          </Box>

          <Box args={[width * 0.1, height * 0.9, depth * 0.8]} position={[width * 0.4, height * 0.45, 0]}>
            <meshStandardMaterial color="#92400e" />
          </Box>
        </>
      ) : (
        // Coffee table style legs (four cylinders)
        <>
          <Cylinder
            args={[width * 0.03, width * 0.03, height * 0.9, 8]}
            position={[-width * 0.4, height * 0.45, -depth * 0.4]}
          >
            <meshStandardMaterial color="#92400e" />
          </Cylinder>
          <Cylinder
            args={[width * 0.03, width * 0.03, height * 0.9, 8]}
            position={[width * 0.4, height * 0.45, -depth * 0.4]}
          >
            <meshStandardMaterial color="#92400e" />
          </Cylinder>
          \
          <Cylinder
            args={[width * 0.03, width * 0.03, height * 0.9, 8]}
            position={[-width * 0.4, height * 0.45, depth * 0.4]}
          >
            <meshStandardMaterial color="#92400e" />
          </Cylinder>
          <Cylinder
            args={[width * 0.03, width * 0.03, height * 0.9, 8]}
            position={[width * 0.4, height * 0.45, depth * 0.4]}
          >
            <meshStandardMaterial color="#92400e" />
          </Cylinder>
        </>
      )}
    </group>
  )
}

// Enhanced TV component
const TVModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* TV Stand */}
      <Box args={[width, height * 0.2, depth]} position={[0, height * 0.1, 0]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>

      {/* TV Screen */}
      <Box args={[width, height * 0.8, depth * 0.2]} position={[0, height * 0.6, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </Box>

      {/* Screen Display */}
      <Box args={[width * 0.9, height * 0.7, depth * 0.05]} position={[0, height * 0.6, depth * 0.1]}>
        <meshStandardMaterial color="#6b7280" emissive="#6b7280" emissiveIntensity={0.2} />
      </Box>
    </group>
  )
}

// Enhanced Lamp component
const LampModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Base */}
      <Cylinder args={[width * 0.3, width * 0.5, height * 0.1, 16]} position={[0, height * 0.05, 0]}>
        <meshStandardMaterial color="#b45309" />
      </Cylinder>

      {/* Stem */}
      <Cylinder args={[width * 0.05, width * 0.05, height * 0.7, 8]} position={[0, height * 0.45, 0]}>
        <meshStandardMaterial color="#92400e" />
      </Cylinder>

      {/* Lampshade */}
      <Cylinder args={[width * 0.2, width * 0.4, height * 0.3, 16]} position={[0, height * 0.85, 0]}>
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.3} />
      </Cylinder>

      {/* Light source (small point light) */}
      <pointLight position={[0, height * 0.85, 0]} intensity={0.5} distance={3} color="#fff9c4" />
    </group>
  )
}

// Enhanced Plant component
const PlantModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Pot */}
      <Cylinder args={[width * 0.3, width * 0.4, height * 0.3, 16]} position={[0, height * 0.15, 0]}>
        <meshStandardMaterial color="#b45309" />
      </Cylinder>

      {/* Plant base */}
      <Cylinder args={[width * 0.25, width * 0.25, height * 0.1, 16]} position={[0, height * 0.35, 0]}>
        <meshStandardMaterial color="#15803d" />
      </Cylinder>

      {/* Plant foliage (multiple spheres) */}
      <mesh position={[0, height * 0.6, 0]}>
        <sphereGeometry args={[width * 0.35, 16, 16]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>

      <mesh position={[width * 0.15, height * 0.7, width * 0.15]}>
        <sphereGeometry args={[width * 0.25, 16, 16]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>

      <mesh position={[-width * 0.2, height * 0.65, -width * 0.1]}>
        <sphereGeometry args={[width * 0.3, 16, 16]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>

      <mesh position={[width * 0.1, height * 0.8, -width * 0.15]}>
        <sphereGeometry args={[width * 0.2, 16, 16]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>
    </group>
  )
}

// Enhanced Bookshelf component
const BookshelfModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Main structure */}
      <Box args={[width, height, depth]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#92400e" />
      </Box>

      {/* Interior (cutout) */}
      <Box args={[width * 0.9, height * 0.9, depth * 0.9]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#000" transparent opacity={0} />
      </Box>

      {/* Shelves */}
      {[0.2, 0.4, 0.6, 0.8].map((shelfPos, i) => (
        <Box key={`shelf-${i}`} args={[width * 0.9, height * 0.03, depth * 0.9]} position={[0, height * shelfPos, 0]}>
          <meshStandardMaterial color="#92400e" />
        </Box>
      ))}

      {/* Books (random colors on shelves) */}
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((shelfPos, shelfIndex) =>
        Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={`book-${shelfIndex}-${i}`}
            args={[width * 0.15, height * 0.08, depth * 0.7]}
            position={[width * (-0.35 + i * 0.17), height * shelfPos + height * 0.04, 0]}
          >
            <meshStandardMaterial color={["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"][i % 5]} />
          </Box>
        )),
      )}
    </group>
  )
}

// Enhanced Dresser component
const DresserModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Main structure */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#92400e" />
      </RoundedBox>

      {/* Drawers */}
      {[0.25, 0.5, 0.75].map((drawerPos, i) => (
        <RoundedBox
          key={`drawer-${i}`}
          args={[width * 0.9, height * 0.2, depth * 0.05]}
          radius={0.01}
          position={[0, height * drawerPos, depth / 2 - depth * 0.05]}
        >
          <meshStandardMaterial color="#b45309" />
        </RoundedBox>
      ))}

      {/* Drawer handles */}
      {[0.25, 0.5, 0.75].map((drawerPos, i) => (
        <Box
          key={`handle-${i}`}
          args={[width * 0.3, height * 0.03, depth * 0.05]}
          position={[0, height * drawerPos, depth / 2]}
        >
          <meshStandardMaterial color="#f59e0b" />
        </Box>
      ))}
    </group>
  )
}

// Enhanced Nightstand component
const NightstandModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Main structure */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#d97706" />
      </RoundedBox>

      {/* Drawer */}
      <RoundedBox
        args={[width * 0.9, height * 0.2, depth * 0.05]}
        radius={0.01}
        position={[0, height * 0.7, depth / 2 - depth * 0.05]}
      >
        <meshStandardMaterial color="#b45309" />
      </RoundedBox>

      {/* Drawer handle */}
      <Box args={[width * 0.3, height * 0.03, depth * 0.05]} position={[0, height * 0.7, depth / 2]}>
        <meshStandardMaterial color="#f59e0b" />
      </Box>

      {/* Legs */}
      {[
        [-width * 0.4, -depth * 0.4],
        [width * 0.4, -depth * 0.4],
        [-width * 0.4, depth * 0.4],
        [width * 0.4, depth * 0.4],
      ].map((pos, i) => (
        <Cylinder
          key={`leg-${i}`}
          args={[width * 0.05, width * 0.05, height * 0.1, 8]}
          position={[pos[0], height * 0.05, pos[1]]}
        >
          <meshStandardMaterial color="#92400e" />
        </Cylinder>
      ))}
    </group>
  )
}

// Enhanced Door component
const DoorModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Door frame */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#a16207" />
      </RoundedBox>

      {/* Door */}
      <RoundedBox args={[width * 0.9, height * 0.95, depth * 0.5]} radius={0.02} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#d97706" />
      </RoundedBox>

      {/* Door handle */}
      <mesh position={[width * 0.35, height * 0.5, depth * 0.3]}>
        <sphereGeometry args={[width * 0.06, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Enhanced Window component
const WindowModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <group>
      {/* Window frame */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#a16207" />
      </RoundedBox>

      {/* Window glass */}
      <RoundedBox args={[width * 0.9, height * 0.9, depth * 0.2]} radius={0.01} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} metalness={0.2} roughness={0} />
      </RoundedBox>

      {/* Window dividers */}
      <Box args={[width * 0.03, height * 0.9, depth * 0.3]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#a16207" />
      </Box>

      <Box args={[width * 0.9, height * 0.03, depth * 0.3]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#a16207" />
      </Box>
    </group>
  )
}

// Enhanced Rug component
const RugModel = ({ width, depth, height }: { width: number; depth: number; height: number }) => {
  return (
    <RoundedBox args={[width, height, depth]} radius={0.05} position={[0, height / 2, 0]}>
      <meshStandardMaterial color="#fbbf24" />
    </RoundedBox>
  )
}

// Enhanced Furniture component
const Furniture = ({ furniture }: { furniture: FurniturePiece }) => {
  const height = FURNITURE_HEIGHT_MAP[furniture.type] || 0.5

  // Calculate position
  const x = (furniture.x + furniture.width / 2) * SCALE_FACTOR
  const z = (furniture.y + furniture.height / 2) * SCALE_FACTOR
  const y = 0 // Position at floor level

  // Calculate dimensions
  const width = furniture.width * SCALE_FACTOR
  const depth = furniture.height * SCALE_FACTOR

  // Convert rotation from degrees to radians
  const rotationY = (furniture.rotation * Math.PI) / 180

  // Render different furniture types with enhanced models
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      {(() => {
        switch (furniture.type) {
          case "Bed":
            return <BedModel width={width} depth={depth} height={height} />

          case "Sofa":
            return <SofaModel width={width} depth={depth} height={height} />

          case "Chair":
            return <ChairModel width={width} depth={depth} height={height} />

          case "Desk":
          case "Coffee Table":
            return <TableModel width={width} depth={depth} height={height} type={furniture.type} />

          case "TV":
            return <TVModel width={width} depth={depth} height={height} />

          case "Lamp":
            return <LampModel width={width} depth={depth} height={height} />

          case "Plant":
            return <PlantModel width={width} depth={depth} height={height} />

          case "Bookshelf":
            return <BookshelfModel width={width} depth={depth} height={height} />

          case "Dresser":
            return <DresserModel width={width} depth={depth} height={height} />

          case "Nightstand":
            return <NightstandModel width={width} depth={depth} height={height} />

          case "Door":
            return <DoorModel width={width} depth={depth} height={height} />

          case "Window":
            return <WindowModel width={width} depth={depth} height={height} />

          case "Rug":
            return <RugModel width={width} depth={depth} height={height} />

          default:
            // Generic furniture representation with label
            return (
              <group>
                <Box args={[width, height, depth]} position={[0, height / 2, 0]}>
                  <meshStandardMaterial color={FURNITURE_COLOR_MAP[furniture.type] || "#9ca3af"} />
                </Box>

                <Text
                  position={[0, height + 0.1, 0]}
                  rotation={[0, 0, 0]}
                  fontSize={0.15}
                  color="black"
                  anchorX="center"
                  anchorY="bottom"
                >
                  {furniture.type}
                </Text>
              </group>
            )
        }
      })()}
    </group>
  )
}

// Camera controller with improved positioning and controls
const CameraController = ({ room }: { room: Room }) => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Calculate room center and dimensions
    if (room.wallVertices.length > 0) {
      // Find min and max coordinates to determine room bounds
      let minX = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        minZ = Number.POSITIVE_INFINITY,
        maxZ = Number.NEGATIVE_INFINITY

      room.wallVertices.forEach((vertex) => {
        const x = vertex.x * SCALE_FACTOR
        const z = vertex.y * SCALE_FACTOR

        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minZ = Math.min(minZ, z)
        maxZ = Math.max(maxZ, z)
      })

      // Calculate room center and dimensions
      const centerX = (minX + maxX) / 2
      const centerZ = (minZ + maxZ) / 2
      const width = maxX - minX
      const depth = maxZ - minZ
      const roomSize = Math.max(width, depth)

      // Position camera at an optimized isometric angle
      // Use a more pleasing 45-degree angle with proper height
      const distance = roomSize * 1.2
      const cameraHeight = distance * 0.7

      // Position slightly offset from center for a more natural view
      camera.position.set(centerX + distance * 0.6, cameraHeight, centerZ + distance * 0.6)

      // Look at the center of the room
      camera.lookAt(centerX, 0, centerZ)
    } else {
      // Default position if no room data
      camera.position.set(5, 5, 5)
      camera.lookAt(0, 0, 0)
    }
  }, [camera, room.wallVertices])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      minDistance={1}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going below floor
      minPolarAngle={Math.PI / 6} // Prevent camera from going too high
      screenSpacePanning={true} // More intuitive panning
      rotateSpeed={0.7} // Slightly slower rotation for better control
    />
  )
}

// Main 3D Room Planner component
const RoomPlanner3D = ({ room }: RoomPlanner3DProps) => {
  const { theme } = useTheme()

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <CameraController room={room} />
        <ambientLight intensity={0.6} /> {/* Slightly brighter ambient light */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {/* Soft hemisphere light for better overall lighting */}
        <hemisphereLight
          args={[theme === "dark" ? "#202020" : "#ffffff", theme === "dark" ? "#000000" : "#e0e0e0", 0.3]}
          position={[0, 50, 0]}
        />
        {/* Room elements */}
        <Walls vertices={room.wallVertices} />
        {/* Furniture */}
        {room.furniturePieces.map((furniture) => (
          <Furniture key={furniture.id} furniture={furniture} />
        ))}
        {/* Grid for reference - more subtle */}
        <Grid
          infiniteGrid
          fadeDistance={30}
          fadeStrength={3}
          cellSize={0.5}
          cellThickness={0.3}
          cellColor={theme === "dark" ? "#505050" : "#a0a0a0"}
          sectionSize={2}
          sectionThickness={0.8}
          sectionColor={theme === "dark" ? "#707070" : "#505050"}
        />
        {/* Environment */}
        <Environment preset={theme === "dark" ? "night" : "apartment"} />
      </Canvas>
    </div>
  )
}

export default RoomPlanner3D
