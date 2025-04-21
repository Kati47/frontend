// Room Planner module - Vector-based implementation (no images required)

declare global {
  interface Window {
    roomPlanner: RoomPlanner;
  }
}

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Constants
const VERTEX_RADIUS = 7;
const PIXELS_PER_INCH = 4;
const PIXELS_PER_CM = PIXELS_PER_INCH / 2.54;
const CONTROL_BUTTON_SIZE = 24;

// Colors
const COLORS = {
  background: '#FAFAF5',
  grid: '#E1E1E1',
  wall: '#000000',
  vertex: '#5A5A5A',
  dimensionText: '#646464',
  dimensionLine: '#323232',
  
  // Furniture colors
  bed: '#9CB4CC',
  desk: '#A1C7E0',
  chair: '#B6CFDA',
  sofa: '#D2E0FB',
  table: '#CADCFC',
  dresser: '#C3D5E8',
  tv: '#A1B5D8',
  lamp: '#F0F5FA',
  nightstand: '#DAE4F2',
  rug: '#E8EEF8',
  door: '#B8C5D6',
  window: '#D4E3F3',
  default: '#C0D0E5',
  
  // Control button colors
  rotate: '#4A6FA5',
  delete: '#E53E3E',
  resize: '#38A169'
};

function calculateDistance(vertex1: Vertex, vertex2: Vertex): number {
  const xDiff = (vertex1.rect.x + VERTEX_RADIUS) - (vertex2.rect.x + VERTEX_RADIUS);
  const yDiff = (vertex1.rect.y + VERTEX_RADIUS) - (vertex2.rect.y + VERTEX_RADIUS);
  const hypotenuse = Math.sqrt(xDiff ** 2 + yDiff ** 2);
  return hypotenuse / PIXELS_PER_CM;
}

function calculateHalfwayPoint(vertex1: Vertex, vertex2: Vertex): Point {
  const x = (vertex1.rect.x + VERTEX_RADIUS + vertex2.rect.x + VERTEX_RADIUS) / 2;
  const y = (vertex1.rect.y + VERTEX_RADIUS + vertex2.rect.y + VERTEX_RADIUS) / 2;
  return { x, y };
}

class Vertex {
  rect: Rect;
  
  constructor(x: number, y: number) {
    this.rect = {
      x: x - VERTEX_RADIUS,
      y: y - VERTEX_RADIUS,
      width: VERTEX_RADIUS * 2,
      height: VERTEX_RADIUS * 2
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS.vertex;
    ctx.beginPath();
    ctx.roundRect(
      this.rect.x, 
      this.rect.y, 
      this.rect.width, 
      this.rect.height, 
      VERTEX_RADIUS
    );
    ctx.fill();
  }
}

class Furniture {
  type: string;
  rect: Rect;
  angle: number = 0;
  color: string;
  
  // Control button rectangles
  rotateBtnRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
  deleteBtnRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
  widthBtnRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
  heightBtnRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
  
  constructor(type: string) {
    this.type = type;
    
    // Set random position in room area
    const x = Math.random() * 300 + 400;
    const y = Math.random() * 200 + 200;
    
    // Set initial size based on furniture type
    let width = 100;
    let height = 80;
    
    // Set different dimensions and colors based on furniture type
    switch(type.toLowerCase()) {
      case 'bed':
        width = 160;
        height = 200;
        this.color = COLORS.bed;
        break;
      case 'desk':
        width = 120;
        height = 60;
        this.color = COLORS.desk;
        break;
      case 'chair':
        width = 50;
        height = 50;
        this.color = COLORS.chair;
        break;
      case 'sofa':
        width = 200;
        height = 80;
        this.color = COLORS.sofa;
        break;
      case 'table':
        width = 120;
        height = 120;
        this.color = COLORS.table;
        break;
      case 'dresser':
        width = 120;
        height = 50;
        this.color = COLORS.dresser;
        break;
      case 'tv':
        width = 120;
        height = 20;
        this.color = COLORS.tv;
        break;
      case 'lamp':
        width = 40;
        height = 40;
        this.color = COLORS.lamp;
        break;
      case 'nightstand':
        width = 40;
        height = 40;
        this.color = COLORS.nightstand;
        break;
      case 'rug':
        width = 200;
        height = 140;
        this.color = COLORS.rug;
        break;
      case 'door':
        width = 80;
        height = 10;
        this.color = COLORS.door;
        break;
      case 'window':
        width = 100;
        height = 10;
        this.color = COLORS.window;
        break;
      default:
        this.color = COLORS.default;
    }
    
    this.rect = { x, y, width, height };
    this.updateControlPositions();
  }

  updateControlPositions(): void {
    const buttonSize = CONTROL_BUTTON_SIZE;
    
    // Rotate button: bottom-right corner
    this.rotateBtnRect = {
      x: this.rect.x + this.rect.width,
      y: this.rect.y + this.rect.height,
      width: buttonSize,
      height: buttonSize
    };
    
    // Delete button: top-right corner
    this.deleteBtnRect = {
      x: this.rect.x + this.rect.width,
      y: this.rect.y - buttonSize,
      width: buttonSize,
      height: buttonSize
    };
    
    // Width button: middle-right side
    this.widthBtnRect = {
      x: this.rect.x + this.rect.width,
      y: this.rect.y + this.rect.height/2 - buttonSize/2,
      width: buttonSize,
      height: buttonSize
    };
    
    // Height button: top-middle
    this.heightBtnRect = {
      x: this.rect.x + this.rect.width/2 - buttonSize/2,
      y: this.rect.y - buttonSize,
      width: buttonSize,
      height: buttonSize
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Apply rotation
    ctx.translate(this.rect.x + this.rect.width/2, this.rect.y + this.rect.height/2);
    ctx.rotate(this.angle * Math.PI / 180);
    
    // Draw furniture as a rounded rectangle with color
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#7A8B9D';
    ctx.lineWidth = 2;
    
    // Draw rounded rectangle
    const radius = 8; // Corner radius
    ctx.beginPath();
    ctx.roundRect(
      -this.rect.width/2,
      -this.rect.height/2,
      this.rect.width,
      this.rect.height,
      radius
    );
    ctx.fill();
    ctx.stroke();
    
    // Add a label for the furniture type
    ctx.fillStyle = '#5A5A5A';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Truncate text if too long
    const maxTextWidth = this.rect.width - 10;
    let text = this.type;
    if (ctx.measureText(text).width > maxTextWidth) {
      text = text.substring(0, 5) + '...';
    }
    
    ctx.fillText(text, 0, 0);
    
    ctx.restore();
  }
  
  drawControlButton(ctx: CanvasRenderingContext2D, rect: Rect, color: string, symbol: string): void {
    // Draw button background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      rect.x + rect.width/2,
      rect.y + rect.height/2,
      rect.width/2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw symbol
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      symbol,
      rect.x + rect.width/2,
      rect.y + rect.height/2
    );
  }
  
  drawOverlay(ctx: CanvasRenderingContext2D): void {
    this.updateControlPositions();
    
    // Draw control buttons with vector graphics
    this.drawControlButton(ctx, this.rotateBtnRect, COLORS.rotate, '↻');
    this.drawControlButton(ctx, this.deleteBtnRect, COLORS.delete, '×');
    this.drawControlButton(ctx, this.widthBtnRect, COLORS.resize, '↔');
    this.drawControlButton(ctx, this.heightBtnRect, COLORS.resize, '↕');
  }
  
  drawDimensions(ctx: CanvasRenderingContext2D): void {
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.dimensionText;
    
    // Width dimension
    const widthInCm = Math.round(this.rect.width / PIXELS_PER_CM);
    const widthText = `${widthInCm}cm`;
    const widthTextX = this.rect.x + this.rect.width/2 - 15;
    const widthTextY = this.rect.y + this.rect.height + 24;
    
    ctx.fillText(widthText, widthTextX, widthTextY);
    
    // Draw width dimension line
    ctx.strokeStyle = COLORS.dimensionLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.rect.x, this.rect.y + this.rect.height + 14);
    ctx.lineTo(this.rect.x + this.rect.width, this.rect.y + this.rect.height + 14);
    ctx.stroke();
    
    // Height dimension
    const heightInCm = Math.round(this.rect.height / PIXELS_PER_CM);
    const heightText = `${heightInCm}cm`;
    const heightTextX = this.rect.x - 40;
    const heightTextY = this.rect.y + this.rect.height/2;
    
    ctx.fillText(heightText, heightTextX, heightTextY);
    
    // Draw height dimension line
    ctx.beginPath();
    ctx.moveTo(this.rect.x - 14, this.rect.y);
    ctx.lineTo(this.rect.x - 14, this.rect.y + this.rect.height);
    ctx.stroke();
  }
  
  rotateFurniture(mouseX: number, mouseY: number): void {
    const centerX = this.rect.x + this.rect.width/2;
    const centerY = this.rect.y + this.rect.height/2;
    
    const x = mouseX - centerX;
    const y = mouseY - centerY;
    
    this.angle = Math.degrees(Math.atan2(y, x)) + 90;
    
    // Snap to common angles
    if (this.angle > -10 && this.angle < 10) this.angle = 0;
    else if (this.angle > 80 && this.angle < 100) this.angle = 90;
    else if ((this.angle > 170 && this.angle <= 180) || (this.angle < -170 && this.angle >= -180)) this.angle = 180;
    else if (this.angle > -100 && this.angle < -80) this.angle = -90;
  }
  
  scaleWidth(relativeX: number): void {
    if (this.rect.width + relativeX > 15) {
      this.rect.width += relativeX;
    }
  }
  
  scaleHeight(relativeY: number): void {
    if (this.rect.height - relativeY > 15) {
      this.rect.y += relativeY;
      this.rect.height -= relativeY;
    }
  }
}

class Room {
  wallVertices: Vertex[];
  furniturePieces: Furniture[];
  
  constructor() {
    this.wallVertices = [
      new Vertex(650, 100), 
      new Vertex(1118, 100),
      new Vertex(1118, 688), 
      new Vertex(866, 688),
      new Vertex(866, 788), 
      new Vertex(650, 788)
    ];
    this.furniturePieces = [];
  }

  addFurniture(type: string): void {
    this.furniturePieces.push(new Furniture(type));
  }
  
  deleteFurniture(index: number): void {
    if (index >= 0 && index < this.furniturePieces.length) {
      this.furniturePieces.splice(index, 1);
    }
  }
  
  bringFurnitureToTop(index: number): number {
    if (index >= 0 && index < this.furniturePieces.length) {
      const item = this.furniturePieces[index];
      this.furniturePieces.splice(index, 1);
      this.furniturePieces.push(item);
      return this.furniturePieces.length - 1;
    }
    return -1;
  }
  
  addVertex(): void {
    if (this.wallVertices.length >= 10) return; // Limit vertices
    
    const vert1 = this.wallVertices[0];
    const vert2 = this.wallVertices[this.wallVertices.length - 1];
    const halfwayPt = calculateHalfwayPoint(vert1, vert2);
    
    this.wallVertices.push(new Vertex(halfwayPt.x, halfwayPt.y));
  }
  
  removeVertex(): void {
    if (this.wallVertices.length > 3) {
      this.wallVertices.pop();
    }
  }

  drawWalls(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Start at the first vertex
    ctx.moveTo(
      this.wallVertices[0].rect.x + VERTEX_RADIUS,
      this.wallVertices[0].rect.y + VERTEX_RADIUS
    );
    
    // Draw lines to each subsequent vertex
    for (let i = 1; i < this.wallVertices.length; i++) {
      ctx.lineTo(
        this.wallVertices[i].rect.x + VERTEX_RADIUS,
        this.wallVertices[i].rect.y + VERTEX_RADIUS
      );
    }
    
    // Close the path back to the first vertex
    ctx.closePath();
    ctx.stroke();
  }
  
  drawVertices(ctx: CanvasRenderingContext2D): void {
    this.wallVertices.forEach(vertex => vertex.draw(ctx));
  }
  
  drawWallDimensions(ctx: CanvasRenderingContext2D): void {
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.dimensionText;
    
    for (let i = 0; i < this.wallVertices.length; i++) {
      const current = this.wallVertices[i];
      const next = this.wallVertices[(i + 1) % this.wallVertices.length];
      
      const distance = calculateDistance(current, next);
      const halfwayPt = calculateHalfwayPoint(current, next);
      
      // Format and display the dimension
      const dimensionText = `${Math.round(distance)}cm`;
      ctx.fillText(dimensionText, halfwayPt.x + 4, halfwayPt.y - 21);
    }
  }
  
  drawAllFurniture(ctx: CanvasRenderingContext2D, showOverlay: boolean, activeIndex: number): void {
    // Draw all furniture pieces
    this.furniturePieces.forEach(furniture => furniture.draw(ctx));
    
    // Draw overlay for active furniture
    if (showOverlay && activeIndex >= 0 && activeIndex < this.furniturePieces.length) {
      this.furniturePieces[activeIndex].drawOverlay(ctx);
      this.furniturePieces[activeIndex].drawDimensions(ctx);
    }
  }
}

class UserInterface {
  ctx: CanvasRenderingContext2D;
  furniture_panel_width: number;
  screen_width: number;
  screen_height: number;
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.furniture_panel_width = 400;
    this.screen_width = width;
    this.screen_height = height;
  }
  
  drawGrid(ctx: CanvasRenderingContext2D): void {
    const pixelGap = 20;
    
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < this.screen_height; y += pixelGap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.screen_width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < this.screen_width; x += pixelGap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.screen_height);
      ctx.stroke();
    }
  }
}

class RoomPlanner {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  room: Room;
  ui: UserInterface;
  activeVertexIndex: number = -1;
  activeFurnitureIndex: number = -1;
  rotateBtnHeld: boolean = false;
  widthBtnHeld: boolean = false;
  heightBtnHeld: boolean = false;
  showFurnitureOverlay: boolean = false;
  showGrid: boolean = true;
  lastMousePos: Point = { x: 0, y: 0 }; // Track last mouse position for movement
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas dimensions
    this.resizeCanvas();
    
    this.room = new Room();
    this.ui = new UserInterface(this.ctx, this.canvas.width, this.canvas.height);
    
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Setup mouse events
    this.setupEventListeners();
    
    // Start animation loop
    this.animate();
  }
  
  resizeCanvas(): void {
    const container = this.canvas.parentElement!;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }
  
  animate(): void {
    // Clear canvas
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid if enabled
    if (this.showGrid) {
      this.ui.drawGrid(this.ctx);
    }
    
    // Draw room elements
    this.room.drawWalls(this.ctx);
    this.room.drawVertices(this.ctx);
    this.room.drawWallDimensions(this.ctx);
    this.room.drawAllFurniture(this.ctx, this.showFurnitureOverlay, this.activeFurnitureIndex);
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
  
  setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    
    // Touch support for mobile devices
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      this.handlePointerDown(touch);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      this.handlePointerMove(touch);
    });
    
    this.canvas.addEventListener('touchend', () => this.handleMouseUp());
  }
  
  getCanvasMousePosition(e: MouseEvent | Touch): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  handleMouseDown(e: MouseEvent): void {
    this.handlePointerDown(e);
  }
  
  handleMouseMove(e: MouseEvent): void {
    this.handlePointerMove(e);
  }
  
  handlePointerDown(e: MouseEvent | Touch): void {
    const mousePos = this.getCanvasMousePosition(e);
    this.lastMousePos = mousePos;
    
    // Check if a furniture's control button is clicked
    if (this.showFurnitureOverlay && this.activeFurnitureIndex !== -1) {
      const furniture = this.room.furniturePieces[this.activeFurnitureIndex];
      
      if (this.pointInRect(mousePos.x, mousePos.y, furniture.deleteBtnRect)) {
        this.room.deleteFurniture(this.activeFurnitureIndex);
        this.showFurnitureOverlay = false;
        this.activeFurnitureIndex = -1;
        return;
      }
      
      if (this.pointInRect(mousePos.x, mousePos.y, furniture.rotateBtnRect)) {
        this.rotateBtnHeld = true;
        return;
      }
      
      if (this.pointInRect(mousePos.x, mousePos.y, furniture.widthBtnRect)) {
        this.widthBtnHeld = true;
        return;
      }
      
      if (this.pointInRect(mousePos.x, mousePos.y, furniture.heightBtnRect)) {
        this.heightBtnHeld = true;
        return;
      }
    }
    
    // Check if a vertex was clicked
    for (let i = 0; i < this.room.wallVertices.length; i++) {
      const vertex = this.room.wallVertices[i];
      if (this.pointInRect(mousePos.x, mousePos.y, vertex.rect)) {
        this.activeVertexIndex = i;
        break;
      }
    }
    
    // Only handle furniture clicks if no vertex is selected
    if (this.activeVertexIndex === -1) {
      // Check if a furniture piece was clicked
      for (let i = this.room.furniturePieces.length - 1; i >= 0; i--) {
        const furniture = this.room.furniturePieces[i];
        if (this.pointInRect(mousePos.x, mousePos.y, furniture.rect)) {
          this.activeFurnitureIndex = this.room.bringFurnitureToTop(i);
          this.showFurnitureOverlay = true;
          return;
        }
      }
      
      // If neither vertex nor furniture was clicked, turn off overlay
      this.showFurnitureOverlay = false;
    }
  }
  
  handlePointerMove(e: MouseEvent | Touch): void {
    const mousePos = this.getCanvasMousePosition(e);
    
    // Calculate movement delta using last position
    const dx = mousePos.x - this.lastMousePos.x;
    const dy = mousePos.y - this.lastMousePos.y;
    
    this.lastMousePos = mousePos;
    
    if (this.activeVertexIndex !== -1) {
      // Move vertex
      const vertex = this.room.wallVertices[this.activeVertexIndex];
      vertex.rect.x += dx;
      vertex.rect.y += dy;
      
      // Snap vertex to other vertices
      for (let i = 0; i < this.room.wallVertices.length; i++) {
        if (i === this.activeVertexIndex) continue;
        
        const otherVertex = this.room.wallVertices[i];
        
        // Snap X coordinate
        if (Math.abs(vertex.rect.x - otherVertex.rect.x) < 10) {
          vertex.rect.x = otherVertex.rect.x;
        }
        
        // Snap Y coordinate
        if (Math.abs(vertex.rect.y - otherVertex.rect.y) < 10) {
          vertex.rect.y = otherVertex.rect.y;
        }
      }
    } else if (this.activeFurnitureIndex !== -1) {
      const furniture = this.room.furniturePieces[this.activeFurnitureIndex];
      
      if (this.rotateBtnHeld) {
        furniture.rotateFurniture(mousePos.x, mousePos.y);
      } else if (this.widthBtnHeld) {
        furniture.scaleWidth(dx);
      } else if (this.heightBtnHeld) {
        furniture.scaleHeight(dy);
      } else {
        // Move furniture
        furniture.rect.x += dx;
        furniture.rect.y += dy;
      }
    }
  }
  
  handleMouseUp(): void {
    this.activeVertexIndex = -1;
    this.rotateBtnHeld = false;
    this.widthBtnHeld = false;
    this.heightBtnHeld = false;
  }
  
  pointInRect(x: number, y: number, rect: Rect): boolean {
    return x >= rect.x && 
           x <= rect.x + rect.width && 
           y >= rect.y && 
           y <= rect.y + rect.height;
  }
  
  // Public API
  addFurniture(type: string): void {
    this.room.addFurniture(type);
    this.activeFurnitureIndex = this.room.furniturePieces.length - 1;
    this.showFurnitureOverlay = true;
  }
  
  toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }
  
  addRoomVertex(): void {
    this.room.addVertex();
  }
  
  removeRoomVertex(): void {
    this.room.removeVertex();
  }
  
  updateRoomDimensions(width: number, height: number): void {
    // Convert dimensions to pixels
    const pixelWidth = width * PIXELS_PER_CM;
    const pixelHeight = height * PIXELS_PER_CM;
    
    // Get current room center
    let centerX = 0, centerY = 0;
    for (const vertex of this.room.wallVertices) {
      centerX += vertex.rect.x + VERTEX_RADIUS;
      centerY += vertex.rect.y + VERTEX_RADIUS;
    }
    centerX /= this.room.wallVertices.length;
    centerY /= this.room.wallVertices.length;
    
    // Create rectangular room
    const halfWidth = pixelWidth / 2;
    const halfHeight = pixelHeight / 2;
    
    this.room.wallVertices = [
      new Vertex(centerX - halfWidth, centerY - halfHeight),  // Top-left
      new Vertex(centerX + halfWidth, centerY - halfHeight),  // Top-right
      new Vertex(centerX + halfWidth, centerY + halfHeight),  // Bottom-right
      new Vertex(centerX - halfWidth, centerY + halfHeight)   // Bottom-left
    ];
  }
  
  // Save the current state of the room planner
  saveRoomState(): any {
    // Create a serializable representation of the room state
    const furnitureData = this.room.furniturePieces.map(furniture => ({
      type: furniture.type,
      x: furniture.rect.x,
      y: furniture.rect.y,
      width: furniture.rect.width,
      height: furniture.rect.height,
      angle: furniture.angle,
      color: furniture.color
    }));
    
    // Count furniture by type for easy reference
    const furnitureCounts: { [key: string]: number } = {};
    this.room.furniturePieces.forEach(item => {
      furnitureCounts[item.type] = (furnitureCounts[item.type] || 0) + 1;
    });
    
    return {
      furniture: furnitureData,
      furnitureCounts: furnitureCounts,  // Add counts by type
      vertices: this.room.wallVertices.map(vertex => ({
        x: vertex.rect.x,
        y: vertex.rect.y
      })),
      grid: this.showGrid,
      dimensions: {
        width: this.canvas.width,
        height: this.canvas.height
      }
    };
  }
  
  // Load a saved state into the room planner
  loadRoomState(state: any): void {
    if (!state) return;
    
    // Clear current state
    this.room.furniturePieces = [];
    
    // Restore furniture pieces
    if (state.furniture && Array.isArray(state.furniture)) {
      state.furniture.forEach((item: any) => {
        const furniture = new Furniture(item.type);
        furniture.rect.x = item.x;
        furniture.rect.y = item.y;
        furniture.rect.width = item.width;
        furniture.rect.height = item.height;
        furniture.angle = item.angle || 0;
        this.room.furniturePieces.push(furniture);
      });
    }
    
    // Restore vertices if available
    if (state.vertices && Array.isArray(state.vertices)) {
      this.room.wallVertices = state.vertices.map((v: any) => new Vertex(v.x + VERTEX_RADIUS, v.y + VERTEX_RADIUS));
    }
    
    // Restore grid visibility
    if (typeof state.grid === 'boolean') {
      this.showGrid = state.grid;
    }
  }
}

// Helper extension to Math
declare global {
  interface Math {
    degrees(radians: number): number;
  }
}

Math.degrees = function(radians: number): number {
  return radians * 180 / Math.PI;
};

// Initialize the room planner when the module is loaded
export function initRoomPlanner(canvas: HTMLCanvasElement): RoomPlanner {
  const roomPlanner = new RoomPlanner(canvas);
  window.roomPlanner = roomPlanner;
  return roomPlanner;
}