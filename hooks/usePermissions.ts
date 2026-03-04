import { useAuthStore } from "@/store/useAuthStore";


export function usePermissions() {
    const user = useAuthStore((state) => state.user);
}
