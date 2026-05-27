import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-max mx-auto text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <AlertTriangle className="h-20 w-20 text-yellow-400 mb-6 relative animate-bounce" />
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">404</h2>
          <p className="mt-2 text-lg text-gray-600">Page not found.</p>
          <p className="mt-4 text-gray-500 max-w-sm mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-md transition-all active:scale-95"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
