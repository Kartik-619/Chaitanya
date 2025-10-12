module.exports = {
  apps: [{
    name: 'techfest-backend',
    script: 'server.js',
    instances: 1, // CHANGE FROM 'max' TO 1
    exec_mode: 'fork', // CHANGE FROM 'cluster' TO 'fork'
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '500M',
    watch: false,
    autorestart: true,
    restart_delay: 4000
  }]
};