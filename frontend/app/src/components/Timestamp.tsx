import React, { useState, useEffect } from "react";

interface TimestampProps {
    timestamp: number | string;
}

const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now(); // Current time in milliseconds
    const timestampInMs = timestamp * 1000; // Convert seconds to milliseconds
    const diffInSeconds = Math.floor((now - timestampInMs) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

const Timestamp: React.FC<TimestampProps> = ({ timestamp }) => {
    const [timeAgo, setTimeAgo] = useState<string>("");

    useEffect(() => {
        const timeInMs = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;

        const updateTimestamp = () => {
            setTimeAgo(formatTimeAgo(timeInMs));
        };

        updateTimestamp(); // Initial calculation
        const interval = setInterval(updateTimestamp, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, [timestamp]);

    return <span>{timeAgo}</span>;
};

export default Timestamp;