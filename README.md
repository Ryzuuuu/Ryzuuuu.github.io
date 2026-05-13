# 3D Portfolio

A modern, interactive 3D portfolio website built with React, Vite, Three.js, and Tailwind CSS. Showcase your projects and skills with stunning 3D models and smooth animations.

## ✨ Features

- **Interactive 3D Models** - Display 3D assets using Three.js for immersive visuals
- **Fast Performance** - Built with Vite for optimized development and production builds
- **Responsive Design** - Fully responsive layout using Tailwind CSS
- **Smooth Navigation** - Seamless page transitions with React Router
- **Modern UI** - Clean, professional design with smooth animations
- **Projects Showcase** - Dedicated section to display and describe your projects
- **Contact Form** - Easy way for visitors to get in touch
- **About Section** - Personal information and skills showcase

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Next-gen build tool and dev server
- **Three.js** - 3D graphics library
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processor
- **ESLint** - Code quality tool

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/3d-portfolio.git
cd 3d-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
The site will be available at `http://localhost:5173`

## 🔨 Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint
```

## 📁 Project Structure

```
3d-portfolio/
├── src/
│   ├── components/
│   │   ├── Loader.jsx        # Loading spinner component
│   │   └── Navbar.jsx        # Navigation bar
│   ├── models/
│   │   └── Island.jsx        # 3D model component
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── About.jsx         # About section
│   │   ├── Projects.jsx      # Projects showcase
│   │   ├── Contact.jsx       # Contact form
│   │   └── index.js          # Page exports
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── public/                   # Static assets (3D models, images)
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 🎨 Components

### Navbar
Navigation component for site-wide menu and branding. Located in `src/components/Navbar.jsx`

### Loader
Loading spinner displayed while 3D models or resources are loading. Located in `src/components/Loader.jsx`

### Island (3D Model)
Three.js based 3D model component for interactive 3D visualization. Located in `src/models/Island.jsx`

## 📄 Pages

- **Home** - Landing page with hero section and introduction
- **About** - Personal bio, skills, and experience
- **Projects** - Portfolio of projects with descriptions and links
- **Contact** - Contact form for visitor inquiries

## 🎯 Key Features Explained

### 3D Model Rendering
3D models are handled in `src/models/Island.jsx` using Three.js. Models should be placed in the `public/` folder.

### Styling
Global styles in `src/index.css` combined with Tailwind CSS utility classes for component styling.

### State Management
React hooks (useState, useEffect) are used for component state management. For larger apps, consider Redux or Context API.

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages
Update `vite.config.js`:
```javascript
export default {
  base: '/3d-portfolio/',
  // ... rest of config
}
```

## 🚀 Production Build

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

## 💡 Tips for Best Results

1. **Optimize 3D Models** - Use compressed model formats (glTF/glB)
2. **Mobile Testing** - Test on various devices for responsive behavior
3. **SEO** - Add meta tags in `index.html` for better search visibility
4. **Performance** - Use React.lazy() for code splitting
5. **Accessibility** - Add alt text and ARIA labels for screen readers

## 🐛 Troubleshooting

### Models not loading
- Check if model files exist in `public/` folder
- Verify model file paths in component imports
- Check browser console for loading errors

### Slow performance
- Reduce 3D model polygon count
- Enable code splitting with React.lazy()
- Use image optimization tools

### Build errors
- Clear `node_modules/` and reinstall: `npm install`
- Check ESLint errors: `npm run lint`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for improvements.

## 📧 Contact

For questions or inquiries, please use the contact form on the website or reach out directly.

---

**Happy coding! 🚀**
