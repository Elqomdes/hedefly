const { spawn } = require('child_process');
const path = require('path');

// Change to client directory and run npm run dev
process.chdir(path.join(__dirname, '..', 'client'));

const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Client başlatma hatası:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Client process exited with code ${code}`);
  process.exit(code);
});

