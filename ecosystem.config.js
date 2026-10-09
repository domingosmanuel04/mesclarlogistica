// PM2 process file (used automatically if PM2 is available).
// Restart limits avoid crash loops; graceful reload waits for the "ready" signal from server.js.
module.exports = {
  apps: [
    {
      name: "mesclar-logistica",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", PORT: 3000 },
      max_restarts: 10,           // give up after 10 unstable restarts...
      min_uptime: "30s",          // ...a restart counts as unstable if it dies within 30s
      exp_backoff_restart_delay: 1000, // 1s, 1.5s, 2.25s ... up to 15s between restarts
      kill_timeout: 15000,        // time for graceful shutdown (SIGTERM) before SIGKILL
      wait_ready: true,           // server.js calls process.send("ready")
      listen_timeout: 180000,     // includes wait-for-db
      max_memory_restart: "1500M",
      out_file: "./server.log",
      error_file: "./server.log",
      merge_logs: true,
      time: true,
    },
  ],
};
