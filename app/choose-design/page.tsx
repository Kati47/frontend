"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface FurniturePiece {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  roomType: string;
  style: string;
  furniture: FurniturePiece[];
  popularity: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export default function TemplateSelection() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [comparison, setComparison] = useState<Template[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    roomType: 'all',
    style: 'all',
    complexity: 'all',
  });
  
  const [userDescription, setUserDescription] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Template[]>([]);
  
  const canvasRefs = useRef<{[key: string]: HTMLCanvasElement | null}>({});
  
  useEffect(() => {
    // In a real app, this would be loaded from an API
    const templateData: Template[] = [
      {
        id: "living-room-minimalist",
        name: "Minimalist Living Room",
        description: "A clean, modern living room with essential furniture only. Perfect for small spaces.",
        roomType: "Living Room",
        style: "Minimalist",
        furniture: [
          { id: "template-sofa-1", type: "Sofa", x: 100, y: 150, width: 250, height: 100, rotation: 0 },
          { id: "template-table-1", type: "Coffee Table", x: 180, y: 300, width: 100, height: 60, rotation: 0 },
          { id: "template-tv-1", type: "TV", x: 180, y: 50, width: 120, height: 20, rotation: 0 }
        ],
        popularity: 4.5,
        complexity: 'simple'
      },
      {
        id: "living-room-cozy",
        name: "Cozy Family Living Room",
        description: "A comfortable living room setup with plenty of seating for the whole family.",
        roomType: "Living Room",
        style: "Traditional",
        furniture: [
          { id: "template-sofa-2", type: "Sofa", x: 100, y: 150, width: 250, height: 100, rotation: 0 },
          { id: "template-sofa-3", type: "Sofa", x: 100, y: 50, width: 250, height: 100, rotation: 180 },
          { id: "template-table-2", type: "Coffee Table", x: 180, y: 120, width: 120, height: 80, rotation: 0 },
          { id: "template-lamp-1", type: "Lamp", x: 50, y: 50, width: 30, height: 30, rotation: 0 },
          { id: "template-tv-2", type: "TV", x: 400, y: 120, width: 120, height: 20, rotation: 270 }
        ],
        popularity: 4.2,
        complexity: 'medium'
      },
      {
        id: "bedroom-master",
        name: "Master Bedroom Suite",
        description: "A spacious master bedroom with all essentials including dresser and nightstands.",
        roomType: "Bedroom",
        style: "Modern",
        furniture: [
          { id: "template-bed-1", type: "Bed", x: 150, y: 200, width: 200, height: 160, rotation: 0 },
          { id: "template-nstand1", type: "Nightstand", x: 80, y: 150, width: 40, height: 40, rotation: 0 },
          { id: "template-nstand2", type: "Nightstand", x: 380, y: 150, width: 40, height: 40, rotation: 0 },
          { id: "template-dresser", type: "Dresser", x: 150, y: 50, width: 120, height: 50, rotation: 0 }
        ],
        popularity: 4.8,
        complexity: 'medium'
      },
      {
        id: "office-home",
        name: "Home Office Setup",
        description: "A productive home office workspace with ergonomic furniture.",
        roomType: "Office",
        style: "Modern",
        furniture: [
          { id: "template-desk-1", type: "Desk", x: 150, y: 150, width: 180, height: 80, rotation: 0 },
          { id: "template-chair-1", type: "Chair", x: 150, y: 250, width: 60, height: 60, rotation: 0 },
          { id: "template-lamp-2", type: "Lamp", x: 250, y: 130, width: 30, height: 30, rotation: 0 },
          { id: "template-bookshelf", type: "Bookshelf", x: 350, y: 150, width: 100, height: 40, rotation: 0 }
        ],
        popularity: 4.6,
        complexity: 'simple'
      },
      {
        id: "dining-room-formal",
        name: "Formal Dining Room",
        description: "An elegant dining room setup for hosting dinner parties and special occasions.",
        roomType: "Dining Room",
        style: "Traditional",
        furniture: [
          { id: "template-dining-table", type: "Dining Table", x: 180, y: 200, width: 180, height: 100, rotation: 0 },
          { id: "template-chair-2", type: "Chair", x: 100, y: 150, width: 40, height: 40, rotation: 0 },
          { id: "template-chair-3", type: "Chair", x: 260, y: 150, width: 40, height: 40, rotation: 0 },
          { id: "template-chair-4", type: "Chair", x: 100, y: 250, width: 40, height: 40, rotation: 0 },
          { id: "template-chair-5", type: "Chair", x: 260, y: 250, width: 40, height: 40, rotation: 0 },
          { id: "template-lamp-3", type: "Lamp", x: 50, y: 70, width: 30, height: 30, rotation: 0 }
        ],
        popularity: 4.0,
        complexity: 'complex'
      },
      {
        id: "kids-bedroom",
        name: "Kids Bedroom",
        description: "A fun and functional bedroom for children with space for play and study.",
        roomType: "Bedroom",
        style: "Modern",
        furniture: [
          { id: "template-bed-2", type: "Bed", x: 100, y: 150, width: 160, height: 120, rotation: 0 },
          { id: "template-desk-2", type: "Desk", x: 300, y: 150, width: 120, height: 60, rotation: 0 },
          { id: "template-chair-6", type: "Chair", x: 300, y: 230, width: 40, height: 40, rotation: 0 },
          { id: "template-dresser-2", type: "Dresser", x: 100, y: 50, width: 100, height: 50, rotation: 0 }
        ],
        popularity: 4.3,
        complexity: 'medium'
      },
      {
        id: "small-studio-apartment",
        name: "Small Studio Apartment",
        description: "An efficient layout for a small studio apartment with multifunctional furniture.",
        roomType: "Studio",
        style: "Minimalist",
        furniture: [
          { id: "template-sofa-bed", type: "Sofa Bed", x: 100, y: 150, width: 200, height: 100, rotation: 0 },
          { id: "template-small-table", type: "Table", x: 350, y: 150, width: 80, height: 80, rotation: 0 },
          { id: "template-chair-7", type: "Chair", x: 350, y: 250, width: 40, height: 40, rotation: 0 },
          { id: "template-bookshelf-2", type: "Bookshelf", x: 100, y: 50, width: 100, height: 40, rotation: 0 }
        ],
        popularity: 4.7,
        complexity: 'simple'
      },
      {
        id: "outdoor-patio",
        name: "Outdoor Patio",
        description: "A relaxing outdoor patio setup perfect for entertaining guests.",
        roomType: "Outdoor",
        style: "Modern",
        furniture: [
          { id: "template-patio-sofa", type: "Patio Sofa", x: 100, y: 150, width: 200, height: 80, rotation: 0 },
          { id: "template-coffee-table-2", type: "Coffee Table", x: 180, y: 250, width: 80, height: 80, rotation: 0 },
          { id: "template-chair-8", type: "Chair", x: 320, y: 150, width: 60, height: 60, rotation: 0 },
          { id: "template-grill", type: "Grill", x: 400, y: 80, width: 80, height: 40, rotation: 0 }
        ],
        popularity: 4.1,
        complexity: 'medium'
      }
    ];
    
    setTemplates(templateData);
    setFilteredTemplates(templateData);
    
    // Extract unique room types and styles for filters
    const types = [...new Set(templateData.map(t => t.roomType))];
    const styleOptions = [...new Set(templateData.map(t => t.style))];
    
    setRoomTypes(types);
    setStyles(styleOptions);
  }, []);
  
  // Render 2D models whenever templates change
  useEffect(() => {
    // Create a function to render furniture on canvas
    const renderRoomLayout = (template: Template, canvasId: string) => {
      const canvas = canvasRefs.current[canvasId];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw room outline (simple rectangle)
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      // Draw furniture
      template.furniture.forEach(item => {
        // Set colors based on furniture type
        let color;
        switch(item.type.toLowerCase()) {
          case 'sofa':
          case 'sofa bed':
          case 'chair':
          case 'patio sofa':
            color = '#8BB9DD';
            break;
          case 'coffee table':
          case 'table':
          case 'dining table':
          case 'desk':
            color = '#B58C5C';
            break;
          case 'tv':
            color = '#333333';
            break;
          case 'bookshelf':
            color = '#A36336';
            break;
          case 'bed':
            color = '#CCDDEF';
            break;
          case 'nightstand':
          case 'dresser':
            color = '#B58C5C';
            break;
          case 'lamp':
            color = '#F4D738';
            break;
          case 'grill':
            color = '#555555';
            break;
          default:
            color = '#AAAAAA';
        }
        
        // Save context state
        ctx.save();
        
        // Move to center of the furniture for rotation
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation * Math.PI / 180);
        
        // Draw furniture
        ctx.fillStyle = color;
        ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
        
        // Draw outline
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
        
        // Add label if there's enough space
        if (item.width > 40) {
          ctx.fillStyle = '#333';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Truncate text if needed
          const label = item.type.length > 10 ? item.type.substring(0, 8) + '...' : item.type;
          ctx.fillText(label, 0, 0);
        }
        
        // Restore context state
        ctx.restore();
      });
    };
    
    // Render each template's layout on its canvas
    const templatesToRender = [...filteredTemplates, ...comparison];
    const uniqueTemplatesToRender = Array.from(new Set(templatesToRender.map(t => t.id)))
      .map(id => templatesToRender.find(t => t.id === id)!);
      
    setTimeout(() => {
      uniqueTemplatesToRender.forEach(template => {
        renderRoomLayout(template, template.id);
      });
    }, 100);
  }, [filteredTemplates, comparison]);
  
  // Filter templates when filters change
  useEffect(() => {
    let results = templates;
    
    if (filters.roomType !== 'all') {
      results = results.filter(t => t.roomType === filters.roomType);
    }
    
    if (filters.style !== 'all') {
      results = results.filter(t => t.style === filters.style);
    }
    
    if (filters.complexity !== 'all') {
      results = results.filter(t => t.complexity === filters.complexity);
    }
    
    setFilteredTemplates(results);
  }, [filters, templates]);
  
  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };
  
  const toggleComparison = (template: Template) => {
    if (comparison.some(t => t.id === template.id)) {
      setComparison(comparison.filter(t => t.id !== template.id));
    } else {
      if (comparison.length < 3) {
        setComparison([...comparison, template]);
      } else {
        alert('You can compare up to 3 templates at a time.');
      }
    }
  };
  
  const applyTemplate = (template: Template) => {
    // Save the selected template to localStorage
    localStorage.setItem('selectedTemplate', JSON.stringify(template.furniture));
    // Navigate back to the room planner
    router.push('/room-planner');
  };
  
  const clearComparison = () => {
    setComparison([]);
  };
  
  const handleSearchByDescription = () => {
    if (!userDescription.trim()) {
      return;
    }
    
    setIsSearching(true);
    
    // In a real application, this would be an API call to a backend with AI capabilities
    // For this demo, we'll simulate AI search with basic keyword matching
    setTimeout(() => {
      const keywords = userDescription.toLowerCase().split(/\s+/);
      
      // Search in name, description, roomType, style
      const results = templates.filter(template => {
        const searchableText = `${template.name} ${template.description} ${template.roomType} ${template.style}`.toLowerCase();
        
        // Calculate a simple match score based on how many keywords match
        const matchScore = keywords.reduce((score, keyword) => {
          if (searchableText.includes(keyword)) {
            return score + 1;
          }
          return score;
        }, 0);
        
        // Only return templates with at least one matching keyword
        return matchScore > 0;
      });
      
      // Sort by match relevance (in a real app, this would be done by the AI)
      results.sort((a, b) => {
        const aMatches = keywords.filter(keyword => 
          `${a.name} ${a.description} ${a.roomType} ${a.style}`.toLowerCase().includes(keyword)
        ).length;
        
        const bMatches = keywords.filter(keyword => 
          `${b.name} ${b.description} ${b.roomType} ${b.style}`.toLowerCase().includes(keyword)
        ).length;
        
        return bMatches - aMatches;
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 1000); // Simulate API delay
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">Room Templates</h1>
            <button
              onClick={() => router.push('/room-planner')}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Room Planner
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {comparison.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Clear Comparison ({comparison.length})
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Description Search */}
      <div className="bg-blue-50 border-b border-blue-200 py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Describe Your Ideal Room</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tell us what you're looking for, and we'll find the perfect template for you.
            For example: "a cozy living room with a sofa and coffee table" or "a minimalist bedroom for a small space"
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="Describe your ideal room..."
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={2}
            />
            <button
              onClick={handleSearchByDescription}
              disabled={!userDescription.trim() || isSearching}
              className={`px-6 py-2 rounded-md transition text-white ${
                !userDescription.trim() || isSearching
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSearching ? 'Searching...' : 'Find Templates'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="container mx-auto px-4 py-8 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
            <button
              onClick={() => setSearchResults([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Results
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map(template => (
              <div 
                key={template.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden transition ${
                  comparison.some(t => t.id === template.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                }`}
              >
                <div className="h-48 bg-gray-100 relative border-b border-gray-200">
                  <canvas 
                    ref={(el) => canvasRefs.current[template.id] = el}
                    id={`canvas-${template.id}`}
                    width={480}
                    height={320}
                    className="w-full h-full"
                  />
                  
                  {comparison.some(t => t.id === template.id) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                      In Comparison
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-lg text-gray-800">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{template.roomType}</span>
                    <span className="text-sm text-gray-600">{template.style}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 mr-2">Complexity:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                      template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 mr-2">Popularity:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                          i < Math.floor(template.popularity) ? 'text-yellow-400' : 'text-gray-300'
                        }`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-600 ml-1">{template.popularity.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Furniture pieces: {template.furniture.length}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => toggleComparison(template)}
                      className={`flex-1 py-2 rounded text-sm transition ${
                        comparison.some(t => t.id === template.id)
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {comparison.some(t => t.id === template.id) ? 'Remove from Comparison' : 'Add to Comparison'}
                    </button>
                    <button
                      onClick={() => applyTemplate(template)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                id="roomType"
                className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.roomType}
                onChange={e => handleFilterChange('roomType', e.target.value)}
              >
                <option value="all">All Room Types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                id="style"
                className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.style}
                onChange={e => handleFilterChange('style', e.target.value)}
              >
                <option value="all">All Styles</option>
                {styles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
              <select
                id="complexity"
                className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.complexity}
                onChange={e => handleFilterChange('complexity', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Section */}
      {comparison.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 py-6">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Template Comparison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparison.map(template => (
                <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-100 relative border-b border-gray-200">
                    <canvas 
                      ref={(el) => canvasRefs.current[template.id] = el}
                      id={`canvas-${template.id}`}
                      width={480}
                      height={320}
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-lg text-gray-800">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{template.roomType}</span>
                      <span className="text-sm text-gray-600">{template.style}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-600 mr-2">Complexity:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                        template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-600 mr-2">Popularity:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                            i < Math.floor(template.popularity) ? 'text-yellow-400' : 'text-gray-300'
                          }`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-600 ml-1">{template.popularity.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Furniture pieces: {template.furniture.length}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      <button
                        onClick={() => toggleComparison(template)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded text-sm transition"
                      >
                        Remove from Comparison
                      </button>
                      <button
                        onClick={() => applyTemplate(template)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
                      >
                        Use This Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add placeholder for empty slots */}
              {[...Array(3 - comparison.length)].map((_, index) => (
                <div key={`empty-${index}`} className="hidden md:block bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
                  <p className="text-gray-400 text-center">Select another template to compare</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Available Templates</h2>
        
        {filteredTemplates.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No templates match your current filters. Try adjusting your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div 
                key={template.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden transition ${
                  comparison.some(t => t.id === template.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                }`}
              >
                <div className="h-48 bg-gray-100 relative border-b border-gray-200">
                  <canvas 
                    ref={(el) => canvasRefs.current[template.id] = el}
                    id={`canvas-${template.id}`}
                    width={480}
                    height={320}
                    className="w-full h-full"
                  />
                  
                  {comparison.some(t => t.id === template.id) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                      In Comparison
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-lg text-gray-800">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{template.roomType}</span>
                    <span className="text-sm text-gray-600">{template.style}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 mr-2">Complexity:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                      template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 mr-2">Popularity:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                          i < Math.floor(template.popularity) ? 'text-yellow-400' : 'text-gray-300'
                        }`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-600 ml-1">{template.popularity.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Furniture pieces: {template.furniture.length}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => toggleComparison(template)}
                      className={`flex-1 py-2 rounded text-sm transition ${
                        comparison.some(t => t.id === template.id)
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {comparison.some(t => t.id === template.id) ? 'Remove from Comparison' : 'Add to Comparison'}
                    </button>
                    <button
                      onClick={() => applyTemplate(template)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}