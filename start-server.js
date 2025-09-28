const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Server başlatılıyor...');

// Server'ı başlat
const server = spawn('node', ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ Server başlatma hatası:', err);
});

server.on('close', (code) => {
  console.log(`Server kapatıldı, çıkış kodu: ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server kapatılıyor...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server kapatılıyor...');
  server.kill('SIGTERM');
  process.exit(0);
});
