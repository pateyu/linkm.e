import { use, useEffect, useState } from "react";
import supabase from "./utils/SupaBaseClient";
type Link = {
  Title: string;
  URL: string;
};
export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [Title, setTitle] = useState<string | undefined>();
  const [URL, setUrl] = useState<string | undefined>();
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      console.log("user: ", user);
      if (user) {
        const userId = user.data.user?.id;
        setIsAuthenticated(true);
        setUserId(userId);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const getLinks = async () => {
      try {
        const { data, error } = await supabase
          .from("links")
          .select("Title, URL")
          .eq("user_id", userId);
        if (error) throw error;
        setLinks(data);
        console.log("data: ", data);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    if (userId) {
      getLinks();
    }
  }, [userId]);

  const addNewLink = async () => {
    try {
      if (Title && URL && userId) {
        const { data, error } = await supabase
          .from("links")
          .insert({
            Title: Title,
            URL: URL,
            user_id: userId,
          })
          .select();
        if (error) throw error;
        console.log("data: ", data);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 px-4">
      {isAuthenticated && (
        <div className="form-control w-full max-w-md p-4">
          <label className="label">
            <span className="label-text text-white">Link Name</span>
          </label>
          <input
            type="text"
            name="Title"
            id="Title"
            placeholder="Link Name"
            className="input input-bordered w-full py-3"
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="label mt-4">
            <span className="label-text text-white">URL</span>
          </label>
          <input
            type="text"
            name="URL"
            id="URL"
            placeholder="URL"
            className="input input-bordered w-full py-3"
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="btn btn-active btn-neutral px-10"
              onClick={addNewLink}
            >
              Add Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
