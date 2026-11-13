import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const LiveClock: React.FC<{ className?: string }> = ({ className }) => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const tick = () => {
            setNow(new Date());
            // Schedule the next update exactly at the start of the next minute
            const msUntilNextMinute = 60000 - (Date.now() % 60000);
            timeout = setTimeout(tick, msUntilNextMinute);
        };

        // First tick aligned to the minute boundary
        const msUntilNextMinute = 60000 - (Date.now() % 60000);
        timeout = setTimeout(tick, msUntilNextMinute);

        return () => clearTimeout(timeout);
    }, []);

    return <span className={className}>{format(now, 'EEE, MMM d, h:mm a')}</span>;
};