// Re-export centralized models from src/lib/models.js so server code and Next.js share schemas
import { User } from '../../src/lib/models.js';
export default User;
