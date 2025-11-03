import React, { useState, useEffect } from 'react';

const Footer = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <footer className="mt-auto pt-6 pb-2 text-center text-xs text-muted-foreground/80">
            <div className="w-full h-px bg-border mb-4"></div>
            <p>
                {formattedDate} - {formattedTime}
            </p>
        </footer>
    );
};

export default Footer;