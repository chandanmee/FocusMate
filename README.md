#FocusMate is an AI-powered productivity application 

FocusMate is an AI-powered productivity application based on the Pomodoro technique, designed to help users stay focused, manage tasks efficiently, and optimize their work experience. It combines smart timers, activity tracking, and AI-generated insights to improve daily productivity.”

Key Features / Modules
•	Pomodoro Timer: Customizable work/break intervals to enhance focus.
•	AI-Powered Summaries & Insights: Generates daily summaries of tasks and provides focus recommendations.
•	Activity Tracking: Tracks completed tasks and Pomodoro sessions.
•	Notifications: Toast and sound alerts for timer events, task reminders, and errors.
•	Theme Switching: Supports dark/light mode for optimal work experience.
•	Task Management: Create, update, and prioritize tasks seamlessly.


## 🚀 Technologies Used

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization

## 📁 Project Structure

```
react-tailwind/
├── public/
│   └── vite.svg              # Static assets
├── src/
│   ├── assets/               # Images, icons, and other assets
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application-specific styles
│   ├── index.css            # Global styles and Tailwind imports
│   └── main.jsx             # Application entry point
├── .gitignore               # Git ignore rules
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── vite.config.js           # Vite configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd react-tailwind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Tailwind CSS Configuration

### Key Configuration Files:

1. **tailwind.config.js** - Main Tailwind configuration
2. **postcss.config.js** - PostCSS plugins including Tailwind
3. **index.css** - Tailwind directives import

### Tailwind Directives in index.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## ⚠️ Common Issues & Solutions

### Tailwind CSS Not Working

**Problem:** Tailwind classes not applying styles

**Solutions:**
1. **Check Tailwind directives** - Ensure `@tailwind` directives are properly imported in `index.css`
2. **Verify PostCSS configuration** - Make sure `postcss.config.js` includes Tailwind plugin
3. **Content paths** - Verify `tailwind.config.js` content paths include all your component files
4. **Build process** - Restart development server after configuration changes

### CSS Conflicts

**Problem:** Custom CSS conflicting with Tailwind utilities

**Solutions:**
1. Use Tailwind's `@layer` directive for custom styles
2. Increase specificity with `!important` or Tailwind's `!` prefix
3. Use CSS modules for component-specific styles

### ESLint Errors

**Problem:** ESLint showing errors for unused variables or imports

**Solutions:**
1. Remove unused imports and variables
2. Use ESLint disable comments for intentionally unused items
3. Configure ESLint rules in `eslint.config.js`

## 🔧 Development Tips

1. **Use Tailwind IntelliSense** - Install the Tailwind CSS IntelliSense VS Code extension
2. **Responsive Design** - Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
3. **Custom Components** - Create reusable components with consistent Tailwind classes
4. **Performance** - Use PurgeCSS (built into Tailwind) to remove unused styles in production

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

This is a boilerplate project. Feel free to customize and extend it based on your project needs.

## 📄 License

MIT License - feel free to use this boilerplate for your projects.
