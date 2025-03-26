module.exports = {
    apps: [
      {
        name: "backend",
        script: "node",
        args: "index.js",
        cwd: "./backend"
      },
      {
        name: "frontend",
        script: "npm",
        args: "start",
        cwd: "./frontend"
      }
    ]
  };
  