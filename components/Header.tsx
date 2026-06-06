import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="border-b bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">PF</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Personal Finance</h1>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;