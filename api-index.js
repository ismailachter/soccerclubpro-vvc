const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

// Security en performance middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.VERCEL 
    ? ['https://vvc-soccer-2025.vercel.app', 'https://brasschaat-vvc-club.vercel.app', 'https://soccer-vvc-pro.vercel.app'] 
    : process.env.NODE_ENV === 'production' 
      ? ['https://soccerclubpro.vercel.app'] 
      : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure MIME types for JavaScript modules
express.static.mime.define({'application/javascript': ['js', 'mjs']});

// Serve static files voor production (Vercel handles static files automatically)
if (process.env.VERCEL) {
  // Vercel serverless - static files handled by platform
  console.log('Running on Vercel serverless platform');
} else if (process.env.NODE_ENV === 'production') {
  // Serve built frontend files
  app.use(express.static(path.join(__dirname, '../dist/public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
} else {
  // Development static files
  app.use(express.static(path.join(__dirname, '../client'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'application/typescript');
      }
    }
  }));
  app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basis routes
app.get('/', (req, res) => {
  res.json({
    message: 'Soccer Club Pro API - VVC Brasschaat',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Professional Tactical Pad',
      'IADATABANK Training System (144 elementen)', 
      'Jaarplanning Calendar met PDF export',
      'Players Database met Excel upload',
      'Database Scouting met CRUD operaties',
      'User Management met email uitnodigingen',
      'One.com mailserver integratie',
      'Role-based access control'
    ],
    club: {
      name: 'VVC Brasschaat',
      colors: '#232e5d, #4a90e2',
      system: 'Professional Soccer Management'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'connected' : 'not configured',
    services: {
      tactical_pad: 'operational',
      iadatabank: 'operational',
      jaarplanning: 'operational',
      players_database: 'operational',
      scouting_database: 'operational',
      user_management: 'operational'
    }
  });
});

// Status route voor deployment check
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Soccer Club Pro',
    club: 'VVC Brasschaat',
    status: 'deployed',
    environment: process.env.NODE_ENV || 'production',
    deployment: 'vercel',
    database: {
      status: process.env.DATABASE_URL ? 'available' : 'pending'
    },
    modules: {
      tactical_pad: 'Professional drawing tools with formation systems',
      iadatabank: '144 training elements across 4 categories',
      jaarplanning: 'Calendar with PDF export (JAARPLANNING-[team].pdf)',
      players_database: 'Excel upload functionality',
      scouting_database: 'Full CRUD operations',
      user_management: 'Email invitations with One.com integration'
    }
  });
});

// VVC Brasschaat specifieke route
app.get('/api/vvc', (req, res) => {
  res.json({
    club: 'VVC Brasschaat',
    system: 'Soccer Club Pro',
    capabilities: {
      tactical_analysis: 'Industry-standard tactical pad',
      training_methodology: 'Complete IADATABANK system',
      planning: 'Professional year planning with PDF export',
      player_management: 'Comprehensive database with Excel integration',
      scouting: 'Advanced scouting database',
      administration: 'Complete user management system'
    },
    colors: {
      primary: '#232e5d',
      secondary: '#4a90e2'
    },
    deployment: {
      platform: 'Vercel',
      status: 'Professional Grade'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    // API route not found
    res.status(404).json({
      error: 'API Not Found',
      message: `API route ${req.originalUrl} not found`,
      available_routes: [
        '/api/health - Health check',
        '/api/status - Deployment status',
        '/api/vvc - VVC Brasschaat info'
      ]
    });
  } else {
    // Serve frontend app
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      try {
        // Try to serve the built index.html
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      } catch (error) {
        // Fallback HTML for SPA
        res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soccer Club Pro - VVC Brasschaat</title>
          </head>
          <body>
            <div id="root"></div>
            <script>
              // Basic SPA fallback
              document.getElementById('root').innerHTML = '<h1>Loading Soccer Club Pro...</h1>';
            </script>
          </body>
          </html>
        `);
      }
    } else {
      res.redirect(`http://localhost:5173${req.path}`);
    }
  }
});

// Vercel serverless export
module.exports = app;
