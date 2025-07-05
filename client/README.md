# Recipe Editor Client

A React-based recipe editor with step-by-step instructions, connection management, and interactive play mode.

## Features

### Connection Management
- **Create Connections**: Connect steps to create a recipe flow
- **Delete Connections**: Remove connections between steps with intelligent restrictions
- **Validation**: Prevents deletion of connections that would break the recipe structure
- **Isolated Node Prevention**: Prevents creation of nodes with no parents and no children

### Play Mode
- **Interactive Execution**: Play through recipes step-by-step
- **Timer Support**: Automatic timers for extended steps with duration
- **Parallel Execution**: Multiple steps can run simultaneously
- **Parent Dependencies**: Steps wait for all parent steps to complete
- **Manual Control**: Complete or skip steps with user interaction
- **Progress Tracking**: Visual feedback for active, completed, and waiting steps

### Connection Deletion Restrictions

The system prevents deletion of connections in the following cases:

1. **Root Step Protection**: Cannot delete the only connection to the root step
2. **Graph Connectivity**: Cannot delete connections that would create disconnected components
3. **Isolated Node Prevention**: Cannot delete connections that would create nodes with no parents and no children
4. **Structure Integrity**: Ensures the recipe remains a valid directed acyclic graph

### How to Use

#### Edit Mode
1. **Enter Edit Mode**: Click the "Edit" button to enable editing features
2. **View Connections**: Parent and child connections are displayed in the side panels
3. **Delete Connections**: 
   - Click the delete icon (🗑️) next to a step in edit mode
   - Only deletable connections will show the delete button
   - The system prevents deletion if it would create isolated nodes
4. **Validation Feedback**: Delete buttons only appear for connections that can be safely deleted

#### Play Mode
1. **Start Recipe**: Click "Start Recipe" to begin execution
2. **Step Execution**: 
   - Steps with no parents start immediately
   - Steps with parents wait for all parents to complete
   - Multiple steps can run in parallel
3. **Timer Steps**: 
   - Steps with duration show countdown timers
   - Click checkmark when timer finishes or skip button to skip
4. **Manual Steps**: 
   - Steps without timers require manual completion
   - Click checkmark to complete or skip button to skip
5. **Progress Tracking**: 
   - View active steps with timers and completion buttons
   - See completed steps in the progress section
6. **Control**: Pause, resume, or stop the recipe at any time

### Technical Implementation

- **Graph Validation**: Uses depth-first search to detect cycles and connectivity issues
- **Isolated Node Detection**: Prevents deletion that would create nodes with no connections
- **State Management**: Redux store with play mode state and step execution tracking
- **Timer System**: Real-time countdown timers for extended steps
- **Dependency Resolution**: Automatic activation of steps when dependencies are met
- **UI Feedback**: Material-UI components with conditional rendering and progress indicators
- **Type Safety**: TypeScript ensures type safety throughout the application

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Running the Application
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
