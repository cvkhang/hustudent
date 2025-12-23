import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed w-full z-50 top-0 start-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="font-bold text-xl text-text-primary tracking-tight">HUSTUDENT</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-text-secondary hidden sm:block">
                  Hi, {user.full_name}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Log out
                </Button>
                <Link to="/feed">
                  <Button size="sm">Go to App</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
