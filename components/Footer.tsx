import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Personal Finance Assistant. All rights reserved.</p>
                    <nav className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
