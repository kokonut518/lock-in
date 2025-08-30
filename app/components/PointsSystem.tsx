import { useState, useEffect, useRef } from "react";

export function usePointsSystem (
    tooLoud: boolean,
    quietPointInterval = 1000, // milliseconds, one point per second
    deductOnIncident = 10
){   
    const [points, setPoints] = useState(0);
    const quietIntervalRef = useRef<NodeJS.Timeout | null > (null);
    const lastWasTooLoud = useRef(false);

    useEffect(() => {
        if (!tooLoud) {
            if (!quietIntervalRef.current) {
                quietIntervalRef.current = setInterval(() => {
                    setPoints((prev) => prev + 1);
                }, quietPointInterval);
            }
        } else {
            if (quietIntervalRef.current) {
                clearInterval(quietIntervalRef.current);
                quietIntervalRef.current = null;
            }
            if (!lastWasTooLoud.current) {
                setPoints((prev) => Math.max(prev - deductOnIncident, 0));
                lastWasTooLoud.current = true;
            }
        }
        if (!tooLoud) {
            lastWasTooLoud.current = false;
        }
        return () => {
            if (quietIntervalRef.current) {
                clearInterval(quietIntervalRef.current);
                quietIntervalRef.current = null;
            }
        };
    }, [tooLoud, quietPointInterval, deductOnIncident]);
    return points;
}