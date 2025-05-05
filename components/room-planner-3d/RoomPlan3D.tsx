"use client";

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Types (matching your existing interfaces)
interface Vertex {
  x: number;
  y: number;
  wallHeight?: number;
}

interface FurniturePiece {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface Room {
  wallVertices: Vertex[];
  furniturePieces: FurniturePiece[];
  wallHeight?: number;
}

interface RoomPlanner3DViewProps {
  room: Room;
}

export const RoomPlanner3DView = ({ room }: RoomPlanner3DViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Set up and render 3D scene
  useEffect(() => {
    if (!containerRef.current || !room) return;

    // Initialize Three.js components
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene if it doesn't exist
    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene();
      sceneRef.current.background = new THREE.Color(0xf8fafc); // Light gray background
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      sceneRef.current.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      sceneRef.current.add(directionalLight);
      
      // Add camera
      cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
      cameraRef.current.position.set(0, 500, 1000);
      cameraRef.current.lookAt(0, 0, 0);
    }
    
    // Create renderer if it doesn't exist
    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current.setSize(width, height);
      container.appendChild(rendererRef.current.domElement);
      
      // Add orbit controls
      if (cameraRef.current) {
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
      }
    }
    
    // Create or update 3D objects based on room data
    renderRoom3D();
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [room]);

  // Render the room in 3D
  const renderRoom3D = () => {
    if (!sceneRef.current) return;
    
    // Clear existing objects
    while (sceneRef.current.children.length > 0) {
      const object = sceneRef.current.children[0];
      if (object instanceof THREE.Light) {
        // Keep lights
        sceneRef.current.children.shift();
        sceneRef.current.add(object);
      } else {
        sceneRef.current.remove(object);
      }
    }
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(2000, 100);
    sceneRef.current.add(gridHelper);
    
    // Center the 3D view based on 2D coordinates
    const center = calculateRoomCenter();
    
    // Create walls
    createWalls(center);
    
    // Create furniture
    createFurniture(center);
    
    // Position camera to view the entire room
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(center.x, 500, center.y + 800);
      cameraRef.current.lookAt(center.x, 0, center.y);
      controlsRef.current.target.set(center.x, 0, center.y);
      controlsRef.current.update();
    }
  };

  // Calculate center of the room for positioning the 3D view
  const calculateRoomCenter = () => {
    const { wallVertices } = room;
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    wallVertices.forEach(vertex => {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
    });
    
    return {
      x: (minX + maxX) / 2 - 884, // Center X (884 is canvas midpoint)
      y: (minY + maxY) / 2 - 444  // Center Y (444 is canvas midpoint)
    };
  };

  // Create 3D walls from 2D vertices
  const createWalls = (center: {x: number, y: number}) => {
    if (!sceneRef.current) return;
    
    const { wallVertices, wallHeight = 250 } = room;
    
    if (wallVertices.length < 3) return;
    
    // Create shape from vertices
    const shape = new THREE.Shape();
    shape.moveTo(wallVertices[0].x - center.x, -wallVertices[0].y + center.y);
    
    for (let i = 1; i < wallVertices.length; i++) {
      shape.lineTo(wallVertices[i].x - center.x, -wallVertices[i].y + center.y);
    }
    
    shape.lineTo(wallVertices[0].x - center.x, -wallVertices[0].y + center.y);
    
    // Create floor
    const floorGeometry = new THREE.ShapeGeometry(shape);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    sceneRef.current.add(floor);
    
    // Create extruded walls
    const wallGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: wallHeight,
      bevelEnabled: false
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      side: THREE.DoubleSide
    });
    
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.rotation.x = Math.PI / 2;
    walls.position.y = 0;
    
    // Add wireframe to walls
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x475569,
      linewidth: 1
    });
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(wallGeometry),
      wireframeMaterial
    );
    walls.add(wireframe);
    
    sceneRef.current.add(walls);
  };

  // Create 3D furniture from 2D pieces
  const createFurniture = (center: {x: number, y: number}) => {
    if (!sceneRef.current) return;
    
    const { furniturePieces } = room;
    
    furniturePieces.forEach(furniture => {
      let geometry: THREE.BufferGeometry;
      let height = 30; // Default furniture height
      let material: THREE.Material;
      let color: THREE.ColorRepresentation;
      
      switch(furniture.type) {
        case 'Bed':
          height = 40;
          color = 0x93c5fd; // blue-300
          break;
        case 'Desk':
          height = 75;
          color = 0xb45309; // amber-700
          break;
        case 'Sofa':
          height = 70;
          color = 0x60a5fa; // blue-400
          break;
        case 'Chair':
          height = 80;
          color = 0xd97706; // amber-600
          break;
        case 'TV':
          height = 80;
          color = 0x1f2937; // gray-800
          break;
        case 'Coffee Table':
          height = 35;
          color = 0xd97706; // amber-600
          break;
        case 'Bookshelf':
          height = 180;
          color = 0x92400e; // amber-800
          break;
        default:
          color = 0x9ca3af; // gray-400
      }
      
      // Create mesh based on furniture type
      geometry = new THREE.BoxGeometry(furniture.width, height, furniture.height);
      material = new THREE.MeshStandardMaterial({ color });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position the furniture
      const xPos = furniture.x + furniture.width / 2 - center.x;
      const zPos = -furniture.y - furniture.height / 2 + center.y;
      
      mesh.position.set(xPos, height / 2, zPos);
      mesh.rotation.y = (furniture.rotation * Math.PI) / 180;
      
      // Add wireframe outline
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, opacity: 0.3, transparent: true })
      );
      mesh.add(wireframe);
      
      if (sceneRef.current) {
        sceneRef.current.add(mesh);
      }
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
};