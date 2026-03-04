import { UserRole } from "@/lib/rbac/permissions";
import { useAuthStore } from "@/store/useAuthStore";


export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const role = user?.role as UserRole;
    return {
        
    }
}
