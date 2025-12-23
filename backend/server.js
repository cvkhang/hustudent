import app from './app.js';
import { init as initSocket } from './socket/socketManager.js';
import env from './config/env.js';

const PORT = env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  initSocket(server);
});

export default server;

