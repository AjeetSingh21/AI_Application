import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let backendProcess;

// Start FastAPI backend
function startBackend() {
  const isDev = process.env.NODE_ENV !== 'production';
  const backendPath = isDev
    ? path.join(__dirname, '../../backend')
    : path.join(process.resourcesPath, 'backend');

  console.log('Starting backend from:', backendPath);

  backendProcess = spawn('py', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: backendPath,
    shell: true
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    backgroundColor: '#1e293b'
  });

  // Load app
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  startBackend();
  
  // Wait for backend to start
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cleanup on quit
app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// IPC handlers
ipcMain.handle('get-backend-url', () => {
  return 'http://127.0.0.1:8000';
});

ipcMain.handle('restart-backend', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  setTimeout(() => {
    startBackend();
  }, 1000);
  return 'Backend restarted';
});
