import { Link } from 'react-router-dom';
import image404 from '../assets/2480259.jpg';

const NotFound = () => {
    return (
        <div className="flex flex-col lg:flex-row 
        items-center justify-center h-screen bg-white p-4">
            {/* Content Section */}
            <div className="w-full lg:w-1/2 text-center lg:text-left p-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                    Oops! Page Not Found
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>
                <Link
                    to="/"
                    className="bg-orange-800 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-md shadow-md transition-all"
                >
                    Go Back Home
                </Link>
            </div>
            {/* Image Section */}
            <div className="w-full lg:w-1/2 flex justify-center">
                <img
                    src={image404}
                    alt="404 Illustration"
                    className="max-w-full h-auto rounded-lg "
                />
            </div>

          
        </div>
    );
};

export default NotFound;
