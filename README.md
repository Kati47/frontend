# 🚀 Frontend - Enterprise-Grade React Application

A comprehensive, production-ready frontend application built with **Next.js 15**, **React 19**, and **TypeScript**. Features an advanced admin dashboard, interactive room planner, product comparison tools, and rich UI components for both users and administrators.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-06B6D4?style=flat-square&logo=tailwindcss)
![3D Support](https://img.shields.io/badge/3D-Three.js-blue?style=flat-square&logo=threedotjs)
![i18n](https://img.shields.io/badge/i18n-Multi--Language-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Core Features

### 👥 **User Features**

- **🛍️ Product Comparison**
  - Compare multiple products side-by-side
  - Filter by features, price, specs, compatibility
  - Get AI-powered buying recommendations
  - View detailed feature differences

- **🏠 Interactive Room Planner**
  - 2D/3D room layout designer
  - Drag-and-drop furniture placement
  - Real-time wall vertex planning
  - Budget planning & cost estimation
  - View recommendations
  - Export room designs

- **🎯 Landing Page**
  - Conversion-optimized homepage
  - Dark/Light mode toggle
  - Multi-language support (i18n)
  - Responsive marketing sections
  - Call-to-action elements

- **💬 Customer Support**
  - Integrated chatbot
  - Real-time messaging
  - Customer help center

### 👨‍💼 **Admin Features**

- **📊 Advanced Admin Dashboard**
  - Real-time analytics & charts
  - Product performance metrics
  - Sales tracking & revenue overview
  - Inventory management
  - User activity monitoring
  - Order status dashboard
  - Customer insights

- **📦 Product Management**
  - Add/edit/delete products
  - Bulk product updates
  - Image management
  - Detailed product forms
  - Tabbed navigation
  - Advanced filtering

- **🎁 Promo Code Management**
  - Create & manage promo codes
  - Set usage limits
  - Target specific products/categories
  - First-time buyer restrictions
  - Live status toggling
  - Code performance tracking

- **👥 Customer Management**
  - View all customers
  - Add/edit customer profiles
  - Assign customer roles
  - Password reset functionality
  - Customer history & analytics
  - Advanced filtering & search

- **📋 Order Management**
  - View all orders
  - Update order status
  - Track shipments
  - Export orders to PDF
  - Message customers
  - Order history & analytics

- **📈 Analytics Dashboard**
  - Revenue tracking
  - Sales performance
  - Inventory levels
  - User engagement
  - Conversion metrics
  - Custom date ranges

### 🎨 **UI Components & Features**

- **Component Library**
  - Navigation menus
  - Tabs & accordions
  - Cards & badges
  - Forms & inputs
  - Calendar picker
  - Dropdowns & selects
  - Buttons & toggles
  - Tooltips & popovers
  - Alerts & modals
  - Progress indicators
  - Radio groups & checkboxes

- **Accessibility**
  - WCAG 2.1 compliant
  - Keyboard navigation
  - Screen reader support
  - ARIA labels

- **Theming**
  - Dark mode support
  - Light mode support
  - System preference detection
  - Custom theme configuration

- **Internationalization (i18n)**
  - Multi-language support
  - Language switching
  - Translation management
  - Locale-specific formatting

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kati47/frontend.git
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_APP_NAME=MyApp
   NEXT_PUBLIC_DEFAULT_LANGUAGE=en
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Build for Production

```bash
npm run build
npm start
```

---

## 📦 Tech Stack

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Framework** | Next.js | 15.1.0 | React metaframework |
| **Library** | React | 19.0.0 | UI library |
| **Language** | TypeScript | 5 | Type safety |
| **Styling** | Tailwind CSS | Latest | Utility-first CSS |
| **UI Components** | Radix UI | 1.x | Accessible components |
| **Icons** | Lucide React | 0.454.0 | Icon library |
| **3D Graphics** | Three.js | 0.175.0 | 3D rendering |
| **3D React** | @react-three/fiber | 9.1.2 | React Three.js |
| **3D Helpers** | @react-three/drei | 10.0.6 | Three.js utilities |
| **Forms** | react-hook-form | 7.54.1 | Form state management |
| **Validation** | Zod | 3.24.1 | Schema validation |
| **Animations** | Framer Motion | 12.9.4 | Animation library |
| **Charts** | Recharts | Latest | Data visualization |
| **Carousel** | embla-carousel-react | 8.5.1 | Carousel component |
| **i18n** | i18next | 25.0.2 | Internationalization |
| **i18n React** | react-i18next | 15.5.1 | React i18n |
| **Next i18n** | next-i18next | 15.4.2 | Next.js i18n |
| **Theming** | next-themes | Latest | Theme management |
| **Notifications** | sonner | 1.7.1 | Toast notifications |
| **Toasts** | react-hot-toast | 2.5.2 | Toast library |
| **Date Picker** | react-day-picker | 8.10.1 | Calendar component |
| **Date Utils** | date-fns | 4.1.0 | Date utilities |
| **PDF Export** | jspdf | 3.0.1 | PDF generation |
| **JWT** | jwt-decode | 4.0.0 | JWT decoding |
| **Command Palette** | cmdk | 1.0.4 | Command menu |
| **OTP Input** | input-otp | 1.4.1 | OTP input field |
| **Panels** | react-resizable-panels | 2.1.7 | Resizable panels |
| **Animations** | tailwindcss-animate | 1.0.7 | Tailwind animations |
| **Motion** | vaul | 0.9.6 | Drawer component |

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Admin dashboard
│   ├── (user)/                 # User pages
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Forms.tsx
│   │   └── ...
│   ├── admin/                  # Admin components
│   │   ├── Dashboard.tsx
│   │   ├── ProductForm.tsx
│   │   ├── OrderManager.tsx
│   │   └── ...
│   ├── user/                   # User components
│   │   ├── ProductComparison.tsx
│   │   ├── RoomPlanner.tsx
│   │   └── ...
│   └── layout/                 # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Navbar.tsx
│       └── Chatbot.tsx
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useRoomPlanner.ts
│   └── ...
├── services/                   # API services
│   ├── api.ts
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   └── ...
├── utils/                      # Helper functions
│   ├── constants.ts
│   ├── validators.ts
│   └── formatters.ts
├── styles/                     # Global styles
│   └── globals.css
├── public/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── models/                 # 3D models for room planner
├── lib/
│   ├── cn.ts                   # Utility functions
│   └── auth.ts                 # Auth helpers
├── types/                      # TypeScript types
│   ├── index.ts
│   └── api.ts
├── config/
│   ├── i18n.config.ts          # i18n configuration
│   └── tailwind.config.ts
├── .env.example                # Environment template
├── .env.local                  # Environment variables (git ignored)
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # This file
```

---

## 🔌 Key Sections

### 📊 Admin Dashboard
```
/admin/dashboard
├── Overview (Revenue, Orders, Users)
├── Analytics Charts
├── Product Performance
├── Inventory Status
└── Quick Actions
```

### 📦 Product Management
```
/admin/products
├── Product List
├── Add/Edit Product
├── Bulk Upload
├── Image Management
└── Category Management
```

### 🎁 Promo Codes
```
/admin/promo-codes
├── Code List
├── Create Code
├── View Analytics
└── Status Toggle
```

### 👥 Customer Management
```
/admin/customers
├── Customer List
├── Customer Profiles
├── Activity History
└── Role Assignment
```

### 🛒 Order Management
```
/admin/orders
├── Order List
├── Order Details
├── Status Updates
├── PDF Export
└── Customer Messages
```

### 🛍️ Product Comparison (User)
```
/products/compare
├── Select Products
├── Feature Comparison
├── Price Analysis
├── Recommendations
└── Buying Guide
```

### 🏠 Room Planner (User)
```
/room-planner
├── Room Setup
├── Furniture Placement
├── 2D/3D Views
├── Budget Planning
├── Design Export
└── Recommendations
```

---

## 💡 Usage

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with hot reload |
| `build` | `npm run build` | Build for production |
| `start` | `npm start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# App Settings
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_DEFAULT_LANGUAGE=en

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_CHATBOT=true
NEXT_PUBLIC_ENABLE_3D=true
```

---

## 🎨 Customization

### Theme Configuration
```typescript
// Dark/Light mode in app
// Built-in next-themes support
// System preference detection
```

### Language Support
```typescript
// Add languages in i18n config
// Translations in public/locales/
// Auto language switching
```

### UI Components
```typescript
// Extends Radix UI
// Custom Tailwind styling
// Fully customizable
```

---

## 🧪 Testing

```bash
# Run tests (if configured)
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop excellence
- ✅ Touch-friendly interactions
- ✅ Landscape/portrait support

---

## ♿ Accessibility

- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Focus management

---

## 🚀 Performance

- ✅ Next.js optimizations
- ✅ Code splitting
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Caching strategies

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Guidelines
- Follow TypeScript strict mode
- Write meaningful commit messages
- Add comments for complex logic
- Test new features
- Follow the existing code style

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Kati47** - [GitHub Profile](https://github.com/Kati47)

### Support & Contact

For questions or issues:
- Open an issue on [GitHub](https://github.com/Kati47/frontend/issues)
- Contact: [Kati47](https://github.com/Kati47)

---

**Built with ❤️ for modern, scalable, accessible web applications**
