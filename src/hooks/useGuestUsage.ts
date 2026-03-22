import { useState } from "react";

const FREE_GENERATION_LIMIT = 5;
const STORAGE_KEY = "memehunt-free-generations-used";

export const useGuestUsage = ()=>{
const [usageCount, setUsageCount] = useState(() => {
    if (typeof window === "undefined") return 0;

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : 0;
});

const incrementUsage = ()=>{
    setUsageCount(prev =>{
        const next = prev + 1;
        localStorage.setItem(STORAGE_KEY, String(next));
        return next;
    })
}

const resetUsage = ()=>{
    localStorage.removeItem(STORAGE_KEY);
    setUsageCount(0);
}

return{
    usageCount,
    incrementUsage,
    resetUsage,
    limit: FREE_GENERATION_LIMIT,
    remainingUsage: Math.max(0, FREE_GENERATION_LIMIT - usageCount),
    isLimitReached: usageCount >= FREE_GENERATION_LIMIT
}


}
