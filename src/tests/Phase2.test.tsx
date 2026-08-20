import AiConcierge from '../pages/AiConcierge';
import { AuthProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Stub out Framer Motion
vi.mock('framer-motion', async () => {