import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
            Return to Home
          </Link>
          <Link to="/products" className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition border border-border">
            Shop Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
