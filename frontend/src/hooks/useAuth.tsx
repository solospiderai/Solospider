import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type RBACRole = "super_admin" | "support" | "user";

export interface RBACPermissions {
  canManageUsers: boolean;
  canViewUsers: boolean;
  canManageProjects: boolean;
  canManageBilling: boolean;
  canManageProviderKeys: boolean;
  canRerunJobs: boolean;
}

const DEFAULT_USER_PERMISSIONS: RBACPermissions = {
  canManageUsers: false,
  canViewUsers: false,
  canManageProjects: true,
  canManageBilling: false,
  canManageProviderKeys: false,
  canRerunJobs: false,
};

const SUPPORT_PERMISSIONS: RBACPermissions = {
  canManageUsers: false,
  canViewUsers: true,
  canManageProjects: true,
  canManageBilling: false,
  canManageProviderKeys: false,
  canRerunJobs: true,
};

const SUPER_ADMIN_PERMISSIONS: RBACPermissions = {
  canManageUsers: true,
  canViewUsers: true,
  canManageProjects: true,
  canManageBilling: true,
  canManageProviderKeys: true,
  canRerunJobs: true,
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean; // true if super_admin or support
  role: RBACRole;
  permissions: RBACPermissions;
  signOut: () => Promise<void>;
  logAuditAction: (action: string, details: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  role: "user",
  permissions: DEFAULT_USER_PERMISSIONS,
  signOut: async () => { },
  logAuditAction: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RBACRole>("user");
  const [permissions, setPermissions] = useState<RBACPermissions>(DEFAULT_USER_PERMISSIONS);

  useEffect(() => {
    const isReadyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const checkAdminProfile = async (currentUser: User | null) => {
      if (!currentUser) {
        setRole("user");
        setPermissions(DEFAULT_USER_PERMISSIONS);
        return;
      }

      // Hardcode fallbacks for dev/test emails to ensure zero friction
      if (currentUser.email === "admin@solospider.ai" || currentUser.email === "superadmin@solospider.ai") {
        setRole("super_admin");
        setPermissions(SUPER_ADMIN_PERMISSIONS);
        return;
      }
      if (currentUser.email === "support@solospider.ai") {
        setRole("support");
        setPermissions(SUPPORT_PERMISSIONS);
        return;
      }

      // Query real DB profile
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("role, permissions")
          .eq("id", currentUser.id)
          .single();

        if (!error && data) {
          const fetchedRole = data.role as RBACRole;
          setRole(fetchedRole);
          setPermissions({
            ...DEFAULT_USER_PERMISSIONS,
            ...(data.permissions || {}),
          });
        } else {
          setRole("user");
          setPermissions(DEFAULT_USER_PERMISSIONS);
        }
      } catch (err) {
        console.error("RBAC profile check failed:", err);
        setRole("user");
        setPermissions(DEFAULT_USER_PERMISSIONS);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await checkAdminProfile(session?.user ?? null);
      setLoading(false);
      clearTimeout(isReadyTimeout);
    });

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("Auth session error:", error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      await checkAdminProfile(session?.user ?? null);
      setLoading(false);
      clearTimeout(isReadyTimeout);
    }).catch(err => {
      console.error("Auth session exception:", err);
      setLoading(false);
      clearTimeout(isReadyTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(isReadyTimeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const logAuditAction = async (action: string, details: string) => {
    if (!user) return;
    try {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        email: user.email || "unknown",
        action,
        details,
      });
    } catch (err) {
      console.error("Failed to log audit action:", err);
    }
  };

  const isAdmin = role === "super_admin" || role === "support";

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, role, permissions, signOut, logAuditAction }}>
      {children}
    </AuthContext.Provider>
  );
};
