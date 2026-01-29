import { Link } from 'react-router-dom';
import { FiHome, FiVideo } from 'react-icons/fi';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
            <div className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-8">
                    <FiVideo className="w-12 h-12 text-indigo-400" />
                </div>

                <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">404</h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <Link to="/" className="btn-primary inline-flex items-center space-x-2">
                    <FiHome className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
