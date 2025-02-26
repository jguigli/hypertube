import { createContext, useContext, useState } from "react";

interface VideoContextType {
    searchQuery: string;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {

    const [searchQuery, setSearchQuery] = useState("");

    return (
        <VideoContext.Provider value={{ searchQuery }}>
            {children}
        </VideoContext.Provider>
    );

}

export function useVideo() {
    const context = useContext(VideoContext);
    if (!context) {
        throw new Error("useVideo must be used within a VideoProvider");
    }
    return context;
}
