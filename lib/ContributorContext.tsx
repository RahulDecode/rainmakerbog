"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Contributor } from "@/lib/types";

interface ContributorContextValue {
  loading: boolean;
  contributor: Contributor | null;
  accessToken: string | null;
  refresh: () => Promise<void>;
}

const ContributorContext = createContext<ContributorContextValue>({
  loading: true,
  contributor: null,
  accessToken: null,
  refresh: async () => {},
});

export function useContributor() {
  return useContext(ContributorContext);
}

export function ContributorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      router.replace("/login");
      return;
    }
    setAccessToken(session.access_token);

    const { data, error } = await supabase
      .from("contributors")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .maybeSingle();

    if (error || !data) {
      router.replace("/login");
      return;
    }
    setContributor(data as Contributor);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from Supabase on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContributorContext.Provider value={{ loading, contributor, accessToken, refresh: load }}>
      {children}
    </ContributorContext.Provider>
  );
}
