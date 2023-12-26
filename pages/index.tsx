import { use, useEffect } from "react";
import supabase from "./utils/SupaBaseClient";

export default function Home() {
  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      console.log("user: ", user);
    };
  }, []);
  return;
}
