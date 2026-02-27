import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '../components/common';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface via-white to-primary-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* Animated 404 */}
                <div className="relative inline-flex mb-8">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-slow">
                        <AlertTriangle className="w-16 h-16 text-primary opacity-70" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">!</span>
                    </div>
                </div>

                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h2>
                <p className="text-text-secondary mb-10 leading-relaxed">
                    Sorry, we couldn't find the page you're looking for. The link may be broken,
                    or the page may have been removed.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        variant="primary"
                        leftIcon={<Home className="w-4 h-4" />}
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
