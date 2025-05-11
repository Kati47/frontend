"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import RoomPlanner3D from "./room-planner-3d"
import ViewTransition from "../../../components/view-transition"
const API_URL = "http://localhost:5000/api"
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

interface Design {
  id: string
  name: string
  room: Room
  lastModified: string
}

type DragMode = "vertex" | "furniture" | "rotate" | "resize-n" | "resize-e" | "resize-s" | "resize-w" | null

// Recommendations Component
const RecommendationsPanel = ({
  isOpen,
  onClose,
  room,
  onApplyRecommendation,
}: {
  isOpen: boolean
  onClose: () => void
  room: Room
  onApplyRecommendation: (recommendation: FurniturePiece[]) => void
}) => {
  const [recommendations, setRecommendations] = useState<{ name: string; furniture: FurniturePiece[] }[]>([
    {
      name: "Minimalist Living Room",
      furniture: [
        { id: "rec-sofa", type: "Sofa", x: 700, y: 300, width: 250, height: 100, rotation: 0 },
        { id: "rec-table", type: "Coffee Table", x: 780, y: 450, width: 100, height: 60, rotation: 0 },
        { id: "rec-tv", type: "TV", x: 780, y: 150, width: 120, height: 20, rotation: 0 },
      ],
    },
    {
      name: "Home Office Setup",
      furniture: [
        { id: "rec-desk", type: "Desk", x: 750, y: 300, width: 180, height: 80, rotation: 0 },
        { id: "rec-chair", type: "Chair", x: 750, y: 400, width: 60, height: 60, rotation: 0 },
        { id: "rec-lamp", type: "Lamp", x: 850, y: 280, width: 30, height: 30, rotation: 0 },
      ],
    },
    {
      name: "Bedroom Arrangement",
      furniture: [
        { id: "rec-bed", type: "Bed", x: 750, y: 350, width: 200, height: 160, rotation: 0 },
        { id: "rec-nstand1", type: "Nightstand", x: 680, y: 300, width: 40, height: 40, rotation: 0 },
        { id: "rec-nstand2", type: "Nightstand", x: 980, y: 300, width: 40, height: 40, rotation: 0 },
        { id: "rec-dresser", type: "Dresser", x: 750, y: 200, width: 120, height: 50, rotation: 0 },
      ],
    },
  ])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Room Recommendations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="border rounded-md p-4 hover:shadow-md transition">
              <h3 className="font-medium text-lg mb-2 text-gray-700">{rec.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{rec.furniture.length} items</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {rec.furniture.map((item) => (
                  <span key={item.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {item.type}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  onApplyRecommendation(rec.furniture)
                  onClose()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                Apply This Layout
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Furniture Panel Component
const FurniturePanel = ({ addFurniture }: { addFurniture: (type: string) => void }) => {
  const FURNITURE_ITEMS = [
    { id: "Bed", label: "Bed", bgColor: "bg-blue-300 dark:bg-blue-800", icon: "🛏️" },
    { id: "Desk", label: "Desk", bgColor: "bg-amber-700 dark:bg-amber-800", icon: "🪑" },
    { id: "Nightstand", label: "Nightstand", bgColor: "bg-amber-600 dark:bg-amber-700", icon: "🗄️" },
    { id: "Rug", label: "Rug", bgColor: "bg-amber-400 dark:bg-amber-600", icon: "🧵" },
    { id: "Dresser", label: "Dresser", bgColor: "bg-amber-800 dark:bg-amber-900", icon: "🗄️" },
    { id: "Chair", label: "Chair", bgColor: "bg-amber-600 dark:bg-amber-700", icon: "🪑" },
    { id: "TV", label: "TV", bgColor: "bg-gray-800 dark:bg-gray-900", icon: "📺" },
    { id: "Lamp", label: "Lamp", bgColor: "bg-amber-300 dark:bg-amber-500", icon: "💡" },
    { id: "Door", label: "Door", bgColor: "bg-amber-700 dark:bg-amber-800", icon: "🚪" },
    { id: "Window", label: "Window", bgColor: "bg-sky-300 dark:bg-sky-700", icon: "🪟" },
    { id: "Sofa", label: "Sofa", bgColor: "bg-blue-400 dark:bg-blue-700", icon: "🛋️" },
    { id: "Coffee Table", label: "Coffee Table", bgColor: "bg-amber-500 dark:bg-amber-700", icon: "🪑" },
    { id: "Plant", label: "Plant", bgColor: "bg-green-500 dark:bg-green-700", icon: "🪴" },
    { id: "Bookshelf", label: "Bookshelf", bgColor: "bg-amber-900 dark:bg-amber-950", icon: "📚" },
  ]

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Furniture</h2>

        <div className="grid grid-cols-2 gap-3">
          {FURNITURE_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => addFurniture(item.id)}
              className="bg-white dark:bg-gray-700 rounded-md shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
            >
              <div className={`h-16 ${item.bgColor} flex items-center justify-center`}>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <div className="px-2 py-1 text-center">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Update the ControlPanel component props:
const ControlPanel = ({
  addVertex,
  removeVertex,
  toggleGrid,
  showGrid,
  currentDesignName,
  setCurrentDesignName,
  saveDesign,
  openRecommendations,
  openNewDesignModal,
  openProductRecommendations,
  is3DView,
  toggle3DView,
}: {
  addVertex: () => void
  removeVertex: () => void
  toggleGrid: () => void
  showGrid: boolean
  currentDesignName: string
  setCurrentDesignName: (name: string) => void
  saveDesign: () => void
  openRecommendations: () => void
  openNewDesignModal: () => void
  openProductRecommendations: () => void
  is3DView: boolean
  toggle3DView: () => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Common button style classes
  const baseButtonClasses =
    "px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
  const primaryButtonClasses = `${baseButtonClasses} bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800`
  const secondaryButtonClasses = `${baseButtonClasses} bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700`
  const activeButtonClasses = `${baseButtonClasses} bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-800`
  const dangerButtonClasses = `${baseButtonClasses} bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-800`
  const successButtonClasses = `${baseButtonClasses} bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800`

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Theme toggle button */}
          <button onClick={toggleTheme} className={secondaryButtonClasses}>
            {theme === "light" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark Mode
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
                Light Mode
              </>
            )}
          </button>

          <button onClick={toggleGrid} className={showGrid ? activeButtonClasses : secondaryButtonClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h5v5H5V5zm0 7h5v5H5v-5zm7-7h5v5h-5V5zm0 7h5v5h-5v-5z"
                clipRule="evenodd"
              />
            </svg>
            {showGrid ? "Hide Grid" : "Show Grid"}
          </button>

          <button onClick={toggle3DView} className={is3DView ? primaryButtonClasses : secondaryButtonClasses}>
            {is3DView ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                2D View
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                3D View
              </>
            )}
          </button>

          <button onClick={openRecommendations} className={secondaryButtonClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Layout Ideas
          </button>

          <button onClick={openProductRecommendations} className={secondaryButtonClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Shop Products
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing ? (
            <input
              type="text"
              value={currentDesignName}
              onChange={(e) => setCurrentDesignName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false)
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="font-medium text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              {currentDesignName}
            </div>
          )}

          <button onClick={saveDesign} className={primaryButtonClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save
          </button>

          <button onClick={openNewDesignModal} className={successButtonClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Design
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-700 text-sm font-medium dark:text-gray-300">Corners:</span>
          <button
            onClick={removeVertex}
            className={`${dangerButtonClasses} w-8 h-8 p-0 flex items-center justify-center`}
            title="Remove corner"
          >
            -
          </button>
          <button
            onClick={addVertex}
            className={`${activeButtonClasses} w-8 h-8 p-0 flex items-center justify-center`}
            title="Add corner"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

// Designs Panel Component
const DesignsPanel = ({
  savedDesigns,
  loadDesign,
  currentDesignName,
}: {
  savedDesigns: Design[]
  loadDesign: (designId: string) => void
  currentDesignName: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${isExpanded ? "w-64" : "w-10"}`}
    >
      <div className="h-full flex flex-col">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center h-10 w-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          {isExpanded ? "›" : "‹"}
        </button>

        {isExpanded && (
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Saved Designs</h2>

            {savedDesigns.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">No saved designs yet</p>
            ) : (
              <div className="space-y-2">
                {savedDesigns.map((design) => (
                  <div
                    key={design.id}
                    onClick={() => loadDesign(design.id)}
                    className={`p-3 rounded-md cursor-pointer transition ${
                      design.name === currentDesignName
                        ? "bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500"
                        : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{design.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(design.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ProductRecommendationsPanel = ({
  isOpen,
  onClose,
  furniturePieces,
}: {
  isOpen: boolean
  onClose: () => void
  furniturePieces: FurniturePiece[]
}) => {
  const [budget, setBudget] = useState({ min: 200, max: 1500 })
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get JWT token from localStorage or your auth context
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || "" // Adjust based on your token storage method
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }

  // Extract furniture types for API request
  const getFurnitureItems = () => {
    return [...new Set(furniturePieces.map((item) => item.type.toLowerCase().replace(" ", "-")))]
  }

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get fresh token
      const token = getAuthToken()
      const items = getFurnitureItems()

      if (!token) {
        throw new Error("Authentication required. Please log in.")
      }

      if (items.length === 0) {
        throw new Error("Please add furniture to your room first.")
      }

      // Log request details for debugging
      console.log(`Sending request to: ${API_URL}/products/recommendations`)
      console.log("Request payload:", {
        categories: items,
        budget,
        limit: 8,
      })

      const response = await fetch(`${API_URL}/products/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // For cookies/session
        body: JSON.stringify({
          categories: items,
          budget,
          limit: 8,
        }),
      })

      // Log response status for debugging
      console.log("Response status:", response.status)

      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.")
      }

      // Check content type to diagnose HTML responses
      const contentType = response.headers.get("content-type")
      console.log("Response content-type:", contentType)

      if (contentType && contentType.includes("text/html")) {
        const htmlResponse = await response.text()
        console.error("Server returned HTML instead of JSON:", htmlResponse.substring(0, 200))
        throw new Error("API returned HTML instead of JSON. The server might be down or misconfigured.")
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error("Could not parse error response as JSON")
        }
        throw new Error(errorMessage)
      }

      // Parse JSON response
      const data = await response.json()
      setRecommendations(data)
      console.log("Recommendations received:", data)
    } catch (err: any) {
      console.error("Error fetching recommendations:", err)

      // Provide more helpful error message based on error type
      if (err.message.includes("fetch")) {
        setError("Could not connect to the API server. Please check your connection or try again later.")
      } else {
        setError(err.message || "Failed to fetch recommendations")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && getAuthToken()) {
      fetchRecommendations()
    }
  }, [isOpen])

  const handleBudgetChange = (type: "min" | "max", value: string) => {
    setBudget((prev) => ({ ...prev, [type]: Number.parseInt(value) || 0 }))
  }

  async function addToCart(productId: string) {
    try {
      const token = getAuthToken()

      if (!token) {
        alert("Please log in to add items to your cart")
        return
      }

      if (productId.startsWith("mock-")) {
        // Handle mock products differently
        alert("Product added to cart! (Demo mode)")
        return
      }

      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("text/html")) {
          throw new Error("API server error. Please try again later.")
        }

        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add item to cart")
      }

      alert("Product added to cart!")
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      if (error.message.includes("fetch")) {
        alert("Network error. Please check your connection and try again.")
      } else {
        alert(error.message || "Failed to add to cart")
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Shop Products For Your Room</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="form-controls mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Furniture:</label>
              <div className="flex flex-wrap gap-2">
                {getFurnitureItems().map((item) => (
                  <span key={item} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {item.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range:</label>
              <div className="flex items-center">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={budget.min}
                  onChange={(e) => handleBudgetChange("min", e.target.value)}
                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                <span className="mx-2 text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={budget.max}
                  onChange={(e) => handleBudgetChange("max", e.target.value)}
                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                <button
                  onClick={fetchRecommendations}
                  disabled={loading || !getAuthToken()}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm disabled:bg-gray-400"
                >
                  {loading ? "Loading..." : "Update Results"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
            {error.includes("login") && (
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {recommendations && !loading && (
          <div className="results">
            <h3 className="text-lg font-semibold mb-3">Primary Recommendations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {recommendations.recommendations.primaryProducts.map((product: any) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={product.img || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-800 mb-1 truncate">{product.title}</h4>
                    <p className="text-green-600 font-bold mb-2">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => addToCart(product._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {recommendations.recommendations.complementaryProducts &&
              recommendations.recommendations.complementaryProducts.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-3">You Might Also Need</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {recommendations.recommendations.complementaryProducts.map((product: any) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg"
                      >
                        <div className="h-40 bg-gray-200 overflow-hidden">
                          <img
                            src={product.img || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-800 mb-1 truncate">{product.title}</h4>
                          <p className="text-green-600 font-bold mb-2">${product.price.toFixed(2)}</p>
                          <button
                            onClick={() => addToCart(product._id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            {recommendations.recommendations.budgetFriendly &&
              recommendations.recommendations.budgetFriendly.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Best Value Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {recommendations.recommendations.budgetFriendly.map((product: any) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg"
                      >
                        <div className="h-40 bg-gray-200 overflow-hidden">
                          <img
                            src={product.img || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-800 mb-1 truncate">{product.title}</h4>
                          <p className="text-green-600 font-bold mb-2">${product.price.toFixed(2)}</p>
                          <button
                            onClick={() => addToCart(product._id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            {recommendations.budgetAnalysis && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h3 className="text-lg font-semibold mb-2">Budget Analysis</h3>
                <p className="mb-1">
                  Minimum cost to furnish:{" "}
                  <span className="font-semibold">${recommendations.budgetAnalysis.totalMinCost.toFixed(2)}</span>
                </p>
                <p className="mb-1">
                  Your budget:{" "}
                  <span className="font-semibold">
                    ${recommendations.budgetAnalysis.budgetRange.min} - $
                    {recommendations.budgetAnalysis.budgetRange.max}
                  </span>
                </p>
                <p
                  className={`${recommendations.budgetAnalysis.withinBudget ? "text-green-600" : "text-red-600"} font-semibold`}
                >
                  {recommendations.budgetAnalysis.withinBudget
                    ? "✅ You can furnish within your budget!"
                    : "⚠️ Your budget might not cover all items."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Main Room Planner Component
export default function RoomPlanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState<Room>({
    wallVertices: [
      { x: 650, y: 100 },
      { x: 1118, y: 100 },
      { x: 1118, y: 688 },
      { x: 866, y: 688 },
      { x: 866, y: 788 },
      { x: 650, y: 788 },
    ],
    furniturePieces: [],
  })
  const [newDesignName, setNewDesignName] = useState("")
  const [showProductRecommendations, setShowProductRecommendations] = useState(false)
  const [activeVertexIndex, setActiveVertexIndex] = useState<number>(-1)
  const [activeFurnitureIndex, setActiveFurnitureIndex] = useState<number>(-1)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragMode, setDragMode] = useState<DragMode>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showFurnitureOverlay, setShowFurnitureOverlay] = useState<boolean>(false)
  const [showGrid, setShowGrid] = useState<boolean>(true)
  const [currentDesignName, setCurrentDesignName] = useState<string>("Untitled Design")
  const [savedDesigns, setSavedDesigns] = useState<Design[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showNewDesignModal, setShowNewDesignModal] = useState(false)
  const [isViewTransitioning, setIsViewTransitioning] = useState<boolean | null>(null)

  // For scrolling and zooming
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 900 })
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [is3DView, setIs3DView] = useState(false)

  // Constants for rendering
  const PIXEL_RATIO = 4 // 4px = 1cm
  const VERTEX_RADIUS = 7

  // Load saved designs from localStorage
  useEffect(() => {
    const loadedDesigns = localStorage.getItem("roomPlannerDesigns")
    if (loadedDesigns) {
      setSavedDesigns(JSON.parse(loadedDesigns))
    }
  }, [])

  // Setup canvas and draw initial room
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Adjust for scroll position
    ctx.translate(-viewPosition.x, -viewPosition.y)
    ctx.scale(scale, scale)

    drawRoom()

    return () => {
      // Reset transformations
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }, [room, showGrid, showFurnitureOverlay, activeFurnitureIndex, viewPosition, scale, canvasSize])

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        // Keep canvas at least as large as the container
        setCanvasSize((prev) => ({
          width: Math.max(prev.width, clientWidth),
          height: Math.max(prev.height, clientHeight),
        }))
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial sizing

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Draw the room on the canvas
  const drawRoom = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(viewPosition.x / scale, viewPosition.y / scale, canvas.width / scale, canvas.height / scale)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas)
    }

    // Draw walls
    drawWalls(ctx)

    // Draw furniture
    drawFurniture(ctx)

    // Draw wall vertices
    drawVertices(ctx)

    // Draw wall dimensions
    drawWallDimensions(ctx)
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const gridSize = 20
    ctx.strokeStyle = "#e5e7eb" // Tailwind gray-200
    ctx.lineWidth = 1

    const startX = Math.floor(viewPosition.x / scale / gridSize) * gridSize
    const startY = Math.floor(viewPosition.y / scale / gridSize) * gridSize
    const endX = startX + canvas.width / scale + gridSize
    const endY = startY + canvas.height / scale + gridSize

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }
  }

  const drawWalls = (ctx: CanvasRenderingContext2D) => {
    const { wallVertices } = room
    if (wallVertices.length < 2) return

    ctx.strokeStyle = "#1f2937" // Tailwind gray-800
    ctx.lineWidth = 2
    ctx.beginPath()

    // Move to the first vertex
    ctx.moveTo(wallVertices[0].x, wallVertices[0].y)

    // Connect the vertices
    for (let i = 1; i < wallVertices.length; i++) {
      ctx.lineTo(wallVertices[i].x, wallVertices[i].y)
    }

    // Close the path by connecting back to the first vertex
    ctx.lineTo(wallVertices[0].x, wallVertices[0].y)

    ctx.stroke()
  }

  const drawVertices = (ctx: CanvasRenderingContext2D) => {
    const { wallVertices } = room

    wallVertices.forEach((vertex, index) => {
      ctx.fillStyle = index === activeVertexIndex ? "#3b82f6" : "#6b7280" // Tailwind blue-500 or gray-500
      ctx.beginPath()
      ctx.arc(vertex.x, vertex.y, VERTEX_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const drawWallDimensions = (ctx: CanvasRenderingContext2D) => {
    const { wallVertices } = room

    ctx.font = "16px sans-serif"
    ctx.fillStyle = "#6b7280" // Tailwind gray-500

    for (let i = 0; i < wallVertices.length; i++) {
      const start = wallVertices[i]
      const end = wallVertices[(i + 1) % wallVertices.length]

      // Calculate midpoint
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2

      // Calculate distance in cm
      const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / PIXEL_RATIO

      // Display the dimension
      ctx.fillText(`${distance.toFixed(1)}cm`, midX + 4, midY - 4)
    }
  }

  const drawFurniture = (ctx: CanvasRenderingContext2D) => {
    const { furniturePieces } = room

    furniturePieces.forEach((furniture, index) => {
      // Save context for rotation
      ctx.save()

      // Translate to furniture center for rotation
      const centerX = furniture.x + furniture.width / 2
      const centerY = furniture.y + furniture.height / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((furniture.rotation * Math.PI) / 180)

      // Draw furniture based on its type
      drawFurnitureByType(ctx, furniture)

      // Restore context after rotation
      ctx.restore()

      // Draw overlay controls if this is the active furniture
      if (showFurnitureOverlay && index === activeFurnitureIndex) {
        drawFurnitureOverlay(ctx, furniture)
        drawFurnitureDimensions(ctx, furniture)
      }
    })
  }

  // Draw different furniture shapes based on type
  const drawFurnitureByType = (ctx: CanvasRenderingContext2D, furniture: FurniturePiece) => {
    const halfWidth = furniture.width / 2
    const halfHeight = furniture.height / 2

    // Get furniture color
    let color
    switch (furniture.type) {
      case "Bed":
        color = "#93c5fd"
        break // blue-300
      case "Desk":
        color = "#b45309"
        break // amber-700
      case "Nightstand":
        color = "#d97706"
        break // amber-600
      case "Rug":
        color = "#fbbf24"
        break // amber-400
      case "Dresser":
        color = "#92400e"
        break // amber-800
      case "Chair":
        color = "#d97706"
        break // amber-600
      case "TV":
        color = "#1f2937"
        break // gray-800
      case "Lamp":
        color = "#fcd34d"
        break // amber-300
      case "Door":
        color = "#a16207"
        break // amber-700
      case "Window":
        color = "#7dd3fc"
        break // sky-300
      case "Sofa":
        color = "#60a5fa"
        break // blue-400
      case "Coffee Table":
        color = "#d97706"
        break // amber-600
      case "Plant":
        color = "#34d399"
        break // emerald-400
      case "Bookshelf":
        color = "#92400e"
        break // amber-800
      default:
        color = "#9ca3af" // gray-400
    }

    // Draw different shapes based on furniture type
    switch (furniture.type) {
      case "Bed":
        // Bed frame
        ctx.fillStyle = "#b45309" // amber-700
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height)

        // Mattress
        ctx.fillStyle = color
        ctx.fillRect(-halfWidth + 5, -halfHeight + 5, furniture.width - 10, furniture.height - 10)

        // Pillows
        ctx.fillStyle = "#f3f4f6" // gray-100
        ctx.fillRect(-halfWidth + 10, -halfHeight + 10, furniture.width / 3, furniture.height / 4)
        ctx.fillRect(halfWidth - 10 - furniture.width / 3, -halfHeight + 10, furniture.width / 3, furniture.height / 4)
        break

      case "Sofa":
        // Sofa base
        ctx.fillStyle = color
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height)

        // Sofa back
        ctx.fillStyle = "#3b82f6" // blue-500
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height / 3)

        // Sofa cushions
        ctx.fillStyle = "#60a5fa" // blue-400
        const cushionWidth = furniture.width / 3
        ctx.fillRect(
          -halfWidth + 5,
          -halfHeight + furniture.height / 3 + 5,
          cushionWidth - 5,
          (furniture.height * 2) / 3 - 10,
        )
        ctx.fillRect(
          -halfWidth + 5 + cushionWidth,
          -halfHeight + furniture.height / 3 + 5,
          cushionWidth - 5,
          (furniture.height * 2) / 3 - 10,
        )
        ctx.fillRect(
          -halfWidth + 5 + cushionWidth * 2,
          -halfHeight + furniture.height / 3 + 5,
          cushionWidth - 5,
          (furniture.height * 2) / 3 - 10,
        )
        break

      case "Chair":
        // Chair seat
        ctx.fillStyle = color
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height)

        // Chair back
        ctx.fillStyle = "#b45309" // amber-700
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height / 3)
        break

      case "TV":
        // TV stand
        ctx.fillStyle = "#4b5563" // gray-600
        ctx.fillRect(-halfWidth, halfHeight - furniture.height / 4, furniture.width, furniture.height / 4)

        // TV screen
        ctx.fillStyle = "#1f2937" // gray-800
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height - furniture.height / 4)

        // Screen highlight
        ctx.fillStyle = "#6b7280" // gray-500
        ctx.fillRect(
          -halfWidth + 5,
          -halfHeight + 5,
          furniture.width - 10,
          furniture.height - furniture.height / 4 - 10,
        )
        break

      case "Desk":
        // Desk top
        ctx.fillStyle = color
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height / 3)

        // Desk legs
        ctx.fillStyle = "#92400e" // amber-800
        const legWidth = 8
        ctx.fillRect(-halfWidth, -halfHeight + furniture.height / 3, legWidth, (furniture.height * 2) / 3)
        ctx.fillRect(halfWidth - legWidth, -halfHeight + furniture.height / 3, legWidth, (furniture.height * 2) / 3)
        break

      case "Door":
        // Door frame
        ctx.fillStyle = "#a16207" // amber-700
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height)

        // Door
        ctx.fillStyle = "#d97706" // amber-600
        ctx.fillRect(-halfWidth + 2, -halfHeight + 2, furniture.width - 4, furniture.height - 4)

        // Door handle
        ctx.fillStyle = "#f59e0b" // amber-500
        ctx.beginPath()
        ctx.arc(halfWidth - 10, 0, 3, 0, Math.PI * 2)
        ctx.fill()
        break

      case "Window":
        // Window frame
        ctx.fillStyle = "#a16207" // amber-700
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height)

        // Window glass
        ctx.fillStyle = "#7dd3fc" // sky-300
        ctx.fillRect(-halfWidth + 2, -halfHeight + 2, furniture.width - 4, furniture.height - 4)

        // Window divider
        ctx.fillStyle = "#a16207" // amber-700
        ctx.fillRect(-halfWidth + furniture.width / 2 - 1, -halfHeight, 2, furniture.height)
        break

      case "Plant":
        // Pot
        ctx.fillStyle = "#b45309" // amber-700
        ctx.fillRect(-halfWidth / 2, 0, furniture.width / 2, furniture.height / 2)

        // Plant
        ctx.fillStyle = "#34d399" // emerald-400
        ctx.beginPath()
        ctx.arc(0, -furniture.height / 4, furniture.width / 3, 0, Math.PI * 2)
        ctx.fill()
        break

      default:
        // For other furniture, use a simple rectangle with label
        ctx.fillStyle = color
        ctx.fillRect(-halfWidth, -halfHeight, furniture.width, furniture.height)

        // Add label to identify the furniture type
        ctx.fillStyle = "#ffffff"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(furniture.type, 0, 5)
    }
  }

  const drawFurnitureOverlay = (ctx: CanvasRenderingContext2D, furniture: FurniturePiece) => {
    // Bounding box
    ctx.strokeStyle = "#3b82f6" // blue-500
    ctx.lineWidth = 2
    ctx.strokeRect(furniture.x, furniture.y, furniture.width, furniture.height)

    // Draw resize handles on all sides
    // Top-left
    drawResizeHandle(ctx, furniture.x, furniture.y, "nw")

    // Top-middle
    drawResizeHandle(ctx, furniture.x + furniture.width / 2, furniture.y, "n")

    // Top-right
    drawResizeHandle(ctx, furniture.x + furniture.width, furniture.y, "ne")

    // Middle-right
    drawResizeHandle(ctx, furniture.x + furniture.width, furniture.y + furniture.height / 2, "e")

    // Bottom-right
    drawResizeHandle(ctx, furniture.x + furniture.width, furniture.y + furniture.height, "se")

    // Bottom-middle
    drawResizeHandle(ctx, furniture.x + furniture.width / 2, furniture.y + furniture.height, "s")

    // Bottom-left
    drawResizeHandle(ctx, furniture.x, furniture.y + furniture.height, "sw")

    // Middle-left
    drawResizeHandle(ctx, furniture.x, furniture.y + furniture.height / 2, "w")

    // Delete button (top right)
    ctx.fillStyle = "#ef4444" // red-500
    ctx.beginPath()
    ctx.arc(furniture.x + furniture.width, furniture.y, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("×", furniture.x + furniture.width, furniture.y + 5)

    // Rotate handle (bottom right)
    ctx.fillStyle = "#3b82f6" // blue-500
    ctx.beginPath()
    ctx.arc(furniture.x + furniture.width, furniture.y + furniture.height, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("↻", furniture.x + furniture.width, furniture.y + furniture.height + 5)
  }

  const drawResizeHandle = (ctx: CanvasRenderingContext2D, x: number, y: number, position: string) => {
    ctx.fillStyle = "#10b981" // emerald-500
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawFurnitureDimensions = (ctx: CanvasRenderingContext2D, furniture: FurniturePiece) => {
    // Calculate dimensions in cm
    const widthCm = (furniture.width / PIXEL_RATIO).toFixed(1)
    const heightCm = (furniture.height / PIXEL_RATIO).toFixed(1)

    ctx.font = "14px sans-serif"
    ctx.fillStyle = "#6b7280" // gray-500

    // Draw width dimension
    ctx.fillText(`${widthCm}cm`, furniture.x + furniture.width / 2, furniture.y + furniture.height + 20)

    // Draw height dimension
    ctx.fillText(`${heightCm}cm`, furniture.x - 30, furniture.y + furniture.height / 2)

    // Draw dimension lines
    ctx.strokeStyle = "#9ca3af" // gray-400
    ctx.lineWidth = 1

    // Width dimension line
    ctx.beginPath()
    ctx.moveTo(furniture.x, furniture.y + furniture.height + 10)
    ctx.lineTo(furniture.x + furniture.width, furniture.y + furniture.height + 10)
    ctx.stroke()

    // Height dimension line
    ctx.beginPath()
    ctx.moveTo(furniture.x - 10, furniture.y)
    ctx.lineTo(furniture.x - 10, furniture.y + furniture.height)
    ctx.stroke()
  }

  // Handle mouse down events on the canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Adjust for scroll and zoom
    const x = (e.clientX - rect.left + viewPosition.x) / scale
    const y = (e.clientY - rect.top + viewPosition.y) / scale

    setDragStart({ x, y })

    // Check if clicking on a vertex
    for (let i = 0; i < room.wallVertices.length; i++) {
      const vertex = room.wallVertices[i]
      const distance = Math.sqrt(Math.pow(x - vertex.x, 2) + Math.pow(y - vertex.y, 2))

      if (distance < 10) {
        // 10px radius for easier clicking
        setActiveVertexIndex(i)
        setDragMode("vertex")
        setIsDragging(true)
        return
      }
    }

    // Check if clicking on furniture overlay controls
    if (showFurnitureOverlay && activeFurnitureIndex >= 0) {
      const furniture = room.furniturePieces[activeFurnitureIndex]

      // Delete button (top right)
      const deleteDistance = Math.sqrt(Math.pow(x - (furniture.x + furniture.width), 2) + Math.pow(y - furniture.y, 2))

      if (deleteDistance < 12) {
        deleteFurniture(activeFurnitureIndex)
        return
      }

      // Rotate handle (bottom right)
      const rotateDistance = Math.sqrt(
        Math.pow(x - (furniture.x + furniture.width), 2) + Math.pow(y - (furniture.y + furniture.height), 2),
      )

      if (rotateDistance < 12) {
        setDragMode("rotate")
        setIsDragging(true)
        return
      }

      // Resize handles - check which handle is being clicked
      // Top edge
      if (Math.abs(y - furniture.y) < 10 && x >= furniture.x && x <= furniture.x + furniture.width) {
        setDragMode("resize-n")
        setIsDragging(true)
        return
      }

      // Right edge
      if (
        Math.abs(x - (furniture.x + furniture.width)) < 10 &&
        y >= furniture.y &&
        y <= furniture.y + furniture.height
      ) {
        setDragMode("resize-e")
        setIsDragging(true)
        return
      }

      // Bottom edge
      if (
        Math.abs(y - (furniture.y + furniture.height)) < 10 &&
        x >= furniture.x &&
        x <= furniture.x + furniture.width
      ) {
        setDragMode("resize-s")
        setIsDragging(true)
        return
      }

      // Left edge
      if (Math.abs(x - furniture.x) < 10 && y >= furniture.y && y <= furniture.y + furniture.height) {
        setDragMode("resize-w")
        setIsDragging(true)
        return
      }
    }

    // Check if clicking on a furniture piece
    for (let i = room.furniturePieces.length - 1; i >= 0; i--) {
      const furniture = room.furniturePieces[i]

      // Simple hit test (doesn't account for rotation)
      if (
        x >= furniture.x &&
        x <= furniture.x + furniture.width &&
        y >= furniture.y &&
        y <= furniture.y + furniture.height
      ) {
        setActiveFurnitureIndex(i)
        setShowFurnitureOverlay(true)
        setDragMode("furniture")
        setIsDragging(true)
        return
      }
    }

    // If nothing was clicked, we're panning the view
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle button or Alt+Left button
      setDragMode(null)
      setIsDragging(true)
      return
    }

    // If nothing was clicked, clear selection
    setActiveVertexIndex(-1)
    setActiveFurnitureIndex(-1)
    setShowFurnitureOverlay(false)
  }

  // Handle mouse move events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Adjust for scroll and zoom
    const x = (e.clientX - rect.left + viewPosition.x) / scale
    const y = (e.clientY - rect.top + viewPosition.y) / scale

    if (!isDragging) {
      // Handle cursor change for resize handles when hovering
      if (showFurnitureOverlay && activeFurnitureIndex >= 0) {
        const furniture = room.furniturePieces[activeFurnitureIndex]

        // Change cursor based on position
        if (Math.abs(y - furniture.y) < 10 && x >= furniture.x && x <= furniture.x + furniture.width) {
          canvas.style.cursor = "n-resize"
        } else if (
          Math.abs(x - (furniture.x + furniture.width)) < 10 &&
          y >= furniture.y &&
          y <= furniture.y + furniture.height
        ) {
          canvas.style.cursor = "e-resize"
        } else if (
          Math.abs(y - (furniture.y + furniture.height)) < 10 &&
          x >= furniture.x &&
          x <= furniture.x + furniture.width
        ) {
          canvas.style.cursor = "s-resize"
        } else if (Math.abs(x - furniture.x) < 10 && y >= furniture.y && y <= furniture.y + furniture.height) {
          canvas.style.cursor = "w-resize"
        } else {
          canvas.style.cursor = "default"
        }
      }
      return
    }

    const deltaX = x - dragStart.x
    const deltaY = y - dragStart.y

    if (dragMode === null) {
      // We're panning the view
      setViewPosition({
        x: Math.max(0, viewPosition.x - deltaX * scale),
        y: Math.max(0, viewPosition.y - deltaY * scale),
      })
    } else if (dragMode === "vertex" && activeVertexIndex >= 0) {
      const updatedVertices = [...room.wallVertices]
      updatedVertices[activeVertexIndex] = {
        x: updatedVertices[activeVertexIndex].x + deltaX,
        y: updatedVertices[activeVertexIndex].y + deltaY,
      }

      // Snap vertices to align with other vertices
      for (let i = 0; i < updatedVertices.length; i++) {
        if (i === activeVertexIndex) continue

        const vertex = updatedVertices[i]
        const activeVertex = updatedVertices[activeVertexIndex]

        // Snap horizontally
        if (Math.abs(vertex.x - activeVertex.x) < 10) {
          activeVertex.x = vertex.x
        }

        // Snap vertically
        if (Math.abs(vertex.y - activeVertex.y) < 10) {
          activeVertex.y = vertex.y
        }
      }

      setRoom({
        ...room,
        wallVertices: updatedVertices,
      })
    } else if (dragMode === "furniture" && activeFurnitureIndex >= 0) {
      const updatedFurniture = [...room.furniturePieces]
      updatedFurniture[activeFurnitureIndex] = {
        ...updatedFurniture[activeFurnitureIndex],
        x: updatedFurniture[activeFurnitureIndex].x + deltaX,
        y: updatedFurniture[activeFurnitureIndex].y + deltaY,
      }

      setRoom({
        ...room,
        furniturePieces: updatedFurniture,
      })
    } else if (dragMode === "rotate" && activeFurnitureIndex >= 0) {
      const furniture = room.furniturePieces[activeFurnitureIndex]
      const centerX = furniture.x + furniture.width / 2
      const centerY = furniture.y + furniture.height / 2

      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)

      // Snap to common angles (0, 90, 180, 270)
      let snappedAngle = angle
      if (Math.abs(angle % 90) < 5) {
        snappedAngle = Math.round(angle / 90) * 90
      }

      const updatedFurniture = [...room.furniturePieces]
      updatedFurniture[activeFurnitureIndex] = {
        ...updatedFurniture[activeFurnitureIndex],
        rotation: snappedAngle,
      }

      setRoom({
        ...room,
        furniturePieces: updatedFurniture,
      })
    } else if (dragMode === "resize-n" && activeFurnitureIndex >= 0) {
      // Resize from the top edge
      const updatedFurniture = [...room.furniturePieces]
      const newHeight = updatedFurniture[activeFurnitureIndex].height - deltaY

      if (newHeight > 15) {
        // Minimum height
        updatedFurniture[activeFurnitureIndex] = {
          ...updatedFurniture[activeFurnitureIndex],
          y: updatedFurniture[activeFurnitureIndex].y + deltaY,
          height: newHeight,
        }

        setRoom({
          ...room,
          furniturePieces: updatedFurniture,
        })
      }
    } else if (dragMode === "resize-e" && activeFurnitureIndex >= 0) {
      // Resize from the right edge
      const updatedFurniture = [...room.furniturePieces]
      const newWidth = updatedFurniture[activeFurnitureIndex].width + deltaX

      if (newWidth > 15) {
        // Minimum width
        updatedFurniture[activeFurnitureIndex] = {
          ...updatedFurniture[activeFurnitureIndex],
          width: newWidth,
        }

        setRoom({
          ...room,
          furniturePieces: updatedFurniture,
        })
      }
    } else if (dragMode === "resize-s" && activeFurnitureIndex >= 0) {
      // Resize from the bottom edge
      const updatedFurniture = [...room.furniturePieces]
      const newHeight = updatedFurniture[activeFurnitureIndex].height + deltaY

      if (newHeight > 15) {
        // Minimum height
        updatedFurniture[activeFurnitureIndex] = {
          ...updatedFurniture[activeFurnitureIndex],
          height: newHeight,
        }

        setRoom({
          ...room,
          furniturePieces: updatedFurniture,
        })
      }
    } else if (dragMode === "resize-w" && activeFurnitureIndex >= 0) {
      // Resize from the left edge
      const updatedFurniture = [...room.furniturePieces]
      const newWidth = updatedFurniture[activeFurnitureIndex].width - deltaX

      if (newWidth > 15) {
        // Minimum width
        updatedFurniture[activeFurnitureIndex] = {
          ...updatedFurniture[activeFurnitureIndex],
          x: updatedFurniture[activeFurnitureIndex].x + deltaX,
          width: newWidth,
        }

        setRoom({
          ...room,
          furniturePieces: updatedFurniture,
        })
      }
    }

    setDragStart({ x, y })
  }

  // Add this function before the return statement in the RoomPlanner component:
  // Create a new design and reset the canvas
  const createNewDesign = () => {
    // First save the current design
    saveDesign()

    // Create a new blank design
    const defaultRoom: Room = {
      wallVertices: [
        { x: 650, y: 100 },
        { x: 1118, y: 100 },
        { x: 1118, y: 688 },
        { x: 866, y: 688 },
        { x: 866, y: 788 },
        { x: 650, y: 788 },
      ],
      furniturePieces: [],
    }

    // Reset the room and set the new design name
    setRoom(defaultRoom)
    setCurrentDesignName(newDesignName)

    // Reset states
    setActiveVertexIndex(-1)
    setActiveFurnitureIndex(-1)
    setShowFurnitureOverlay(false)
    setShowNewDesignModal(false)
    setNewDesignName("")

    // Reset view
    resetView()
  }

  // Toggle between 2D and 3D views with smooth transition
  const toggle3DView = () => {
    // Save the current design state before switching views
    if (!is3DView) {
      // If switching to 3D view, save the current state
      saveDesign()
    }

    // Start transition
    setIsViewTransitioning(is3DView ? false : true)
  }

  // Handle completion of view transition
  const handleTransitionComplete = () => {
    setIs3DView(!is3DView)
    setIsViewTransitioning(null)
  }

  // Handle mouse up events
  const handleMouseUp = () => {
    setIsDragging(false)
    setDragMode(null)

    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default"
    }
  }

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const newScale = Math.max(0.5, Math.min(2, scale + delta))

    setScale(newScale)
  }

  // Add a new vertex at the midpoint between first and last vertex
  const addVertex = () => {
    const vertices = [...room.wallVertices]
    const vert1 = vertices[0]
    const vert2 = vertices[vertices.length - 1]

    const halfwayX = (vert1.x + vert2.x) / 2
    const halfwayY = (vert1.y + vert2.y) / 2

    setRoom({
      ...room,
      wallVertices: [...vertices, { x: halfwayX, y: halfwayY }],
    })
  }

  // Remove the last vertex if there are more than 2
  const removeVertex = () => {
    if (room.wallVertices.length > 2) {
      const updatedVertices = [...room.wallVertices]
      updatedVertices.pop()

      setRoom({
        ...room,
        wallVertices: updatedVertices,
      })
    }
  }

  // Add a furniture piece of given type
  const addFurniture = (type: string) => {
    const defaultDimensions = getFurnitureDefaultSize(type)

    const newFurniture: FurniturePiece = {
      id: `furn-${Date.now()}`,
      type,
      x: Math.floor(Math.random() * 300) + 730,
      y: Math.floor(Math.random() * 200) + 330,
      width: defaultDimensions.width,
      height: defaultDimensions.height,
      rotation: 0,
    }

    const updatedFurniture = [...room.furniturePieces, newFurniture]

    setRoom({
      ...room,
      furniturePieces: updatedFurniture,
    })

    setActiveFurnitureIndex(updatedFurniture.length - 1)
    setShowFurnitureOverlay(true)
  }

  // Delete a furniture piece
  const deleteFurniture = (index: number) => {
    const updatedFurniture = [...room.furniturePieces]
    updatedFurniture.splice(index, 1)

    setRoom({
      ...room,
      furniturePieces: updatedFurniture,
    })

    setActiveFurnitureIndex(-1)
    setShowFurnitureOverlay(false)
  }

  // Apply a recommendation layout
  const applyRecommendation = (recommendedFurniture: FurniturePiece[]) => {
    // Add unique IDs to ensure new furnitures
    const newFurniture = recommendedFurniture.map((item) => ({
      ...item,
      id: `furn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }))

    setRoom({
      ...room,
      furniturePieces: newFurniture,
    })

    setActiveFurnitureIndex(-1)
    setShowFurnitureOverlay(false)
  }

  // Save the current design
  const saveDesign = () => {
    const newDesign: Design = {
      id: Date.now().toString(),
      name: currentDesignName,
      room: JSON.parse(JSON.stringify(room)), // Deep copy the room
      lastModified: new Date().toISOString(),
    }

    const existingDesignIndex = savedDesigns.findIndex((design) => design.name === currentDesignName)

    let updatedDesigns: Design[]

    if (existingDesignIndex >= 0) {
      updatedDesigns = [...savedDesigns]
      updatedDesigns[existingDesignIndex] = newDesign
    } else {
      updatedDesigns = [...savedDesigns, newDesign]
    }

    setSavedDesigns(updatedDesigns)
    localStorage.setItem("roomPlannerDesigns", JSON.stringify(updatedDesigns))
  }

  // Load a saved design
  const loadDesign = (designId: string) => {
    const design = savedDesigns.find((design) => design.id === designId)
    if (design) {
      setRoom(JSON.parse(JSON.stringify(design.room))) // Deep copy the room
      setCurrentDesignName(design.name)
      setActiveVertexIndex(-1)
      setActiveFurnitureIndex(-1)
      setShowFurnitureOverlay(false)
    }
  }

  // Toggle grid visibility
  const toggleGrid = () => {
    setShowGrid(!showGrid)
  }

  // Helper function to get default furniture dimensions
  const getFurnitureDefaultSize = (type: string) => {
    switch (type) {
      case "Bed":
        return { width: 200, height: 160 }
      case "Desk":
        return { width: 120, height: 60 }
      case "Nightstand":
        return { width: 40, height: 40 }
      case "Rug":
        return { width: 160, height: 100 }
      case "Dresser":
        return { width: 120, height: 50 }
      case "Chair":
        return { width: 50, height: 50 }
      case "TV":
        return { width: 100, height: 20 }
      case "Lamp":
        return { width: 30, height: 30 }
      case "Door":
        return { width: 80, height: 10 }
      case "Window":
        return { width: 100, height: 10 }
      case "Sofa":
        return { width: 220, height: 100 }
      case "Coffee Table":
        return { width: 100, height: 60 }
      case "Plant":
        return { width: 40, height: 40 }
      case "Bookshelf":
        return { width: 100, height: 40 }
      default:
        return { width: 60, height: 60 }
    }
  }

  // Reset view to center
  const resetView = () => {
    setViewPosition({ x: 0, y: 0 })
    setScale(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header/Control Panel */}
      <ControlPanel
        addVertex={addVertex}
        removeVertex={removeVertex}
        toggleGrid={toggleGrid}
        showGrid={showGrid}
        currentDesignName={currentDesignName}
        setCurrentDesignName={setCurrentDesignName}
        saveDesign={saveDesign}
        openRecommendations={() => setShowRecommendations(true)}
        openNewDesignModal={() => setShowNewDesignModal(true)}
        openProductRecommendations={() => setShowProductRecommendations(true)}
        is3DView={is3DView}
        toggle3DView={toggle3DView}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Furniture Panel */}
        <FurniturePanel addFurniture={addFurniture} />

        {/* Canvas Area */}
        {!is3DView ? (
          <div
            ref={containerRef}
            className="flex-1 relative bg-white dark:bg-gray-900 overflow-auto transition-opacity duration-300"
          >
            <div className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-md shadow-md p-2 flex gap-2">
              <button
                onClick={resetView}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Reset View"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 dark:text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">{Math.round(scale * 100)}%</div>
            </div>

            <canvas
              ref={canvasRef}
              className="min-w-full min-h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
          </div>
        ) : (
          <div ref={containerRef} className="flex-1 relative bg-white dark:bg-gray-900 transition-opacity duration-300">
            <div className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-md shadow-md p-2 flex gap-2">
              <button
                onClick={() => {
                  // Reset camera view in 3D mode
                  if (window.confirm("Reset camera to default view?")) {
                    // The camera will reset based on room dimensions in CameraController
                    setRoom({ ...room })
                  }
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Reset Camera"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 dark:text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <RoomPlanner3D room={room} />
          </div>
        )}

        {/* Designs Panel */}
        <DesignsPanel savedDesigns={savedDesigns} loadDesign={loadDesign} currentDesignName={currentDesignName} />
      </div>

      {/* Recommendations Panel */}
      <RecommendationsPanel
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        room={room}
        onApplyRecommendation={applyRecommendation}
      />

      {/* Product Recommendations Panel */}
      <ProductRecommendationsPanel
        isOpen={showProductRecommendations}
        onClose={() => setShowProductRecommendations(false)}
        furniturePieces={room.furniturePieces}
      />

      {/* New Design Modal */}
      {showNewDesignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Create New Design</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your current design will be saved before creating a new one.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Design Name</label>
              <input
                type="text"
                value={newDesignName}
                onChange={(e) => setNewDesignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Enter design name"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewDesignModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={createNewDesign}
                disabled={!newDesignName.trim()}
                className={`px-4 py-2 text-white rounded-md transition ${
                  newDesignName.trim()
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    : "bg-blue-300 dark:bg-blue-900 cursor-not-allowed"
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Transition Overlay */}
      <ViewTransition isTransitioning={isViewTransitioning} onTransitionComplete={handleTransitionComplete} />
    </div>
  )
}
