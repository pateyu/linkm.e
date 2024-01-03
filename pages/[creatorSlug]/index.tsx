import { useEffect, useState } from "react";
import supabase from "../utils/SupaBaseClient";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/router";

type Link = {
  id: number;
  Title: string;
  URL: string;
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [Title, setTitle] = useState<string | undefined>();
  const [URL, setUrl] = useState<string | undefined>();
  const [links, setLinks] = useState<Link[]>([]);
  const [images, setImages] = useState<ImageListType>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const { creatorSlug } = router.query;
  const [isHalfAuthenticated, setIsHalfAuthenticated] = useState(false);

  const onImageChange = (imageList: ImageListType) => {
    setImages(imageList);
  };
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setUserId(undefined);

      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      console.log("User data: ", data);
      console.log("Error: ", error);

      if (data.user && !error) {
        setIsAuthenticated(true);
        setUserId(data.user.id);
      } else {
        setIsAuthenticated(false);
        setUserId(undefined);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (creatorSlug) {
        // Fetch user details based on creatorSlug
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, profile_picture_url, theme")
          .eq("username", creatorSlug)
          .single();

        if (userData) {
          setProfilePictureUrl(userData.profile_picture_url);
          setTheme(userData.theme);

          // Set half-authenticated state
          const { data: authData } = await supabase.auth.getUser();
          setIsHalfAuthenticated(authData.user?.id !== userData.id);

          // Fetch links for the user
          const { data: linksData } = await supabase
            .from("links")
            .select("id, Title, URL")
            .eq("user_id", userData.id);

          setLinks(linksData || []);
        }

        if (userError) {
          console.error("Error fetching user data:", userError);
          setIsHalfAuthenticated(false);
        }
      }
    };

    fetchData();
  }, [creatorSlug]);

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
        if (links) {
          setLinks([...links, ...data]);
        }
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };
  const uploadProfilePicture = async () => {
    try {
      if (images.length > 0) {
        const image = images[0];
        if (image.file && userId) {
          const { data, error } = await supabase.storage
            .from("publicb")
            .upload(`${userId}/${image.file.name}`, image.file, {
              upsert: true,
            });
          if (error) throw error;
          const res = supabase.storage.from("publicb").getPublicUrl(data.path);
          const publicUrl = res.data.publicUrl;
          const updateUserResponse = await supabase
            .from("users")
            .update({ profile_picture_url: publicUrl })
            .eq("id", userId);
          if (updateUserResponse.error) throw error;
        }
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };
  const removeProfilePicture = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("profile_picture_url")
        .eq("id", userId)
        .single();

      if (userError) throw userError;
      const profilePicUrl = userData.profile_picture_url;

      if (!profilePicUrl) {
        console.log("No profile picture to remove.");
        return;
      }

      const filePath = profilePicUrl.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("publicb")
        .remove([`${userId}/${filePath}`]);

      if (storageError) throw storageError;

      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_picture_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      setProfilePictureUrl(null);
      setImages([]);
      console.log("Profile picture removed successfully.");
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }
  };

  const removeLink = async (linkToRemove: Link) => {
    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", linkToRemove.id);

      if (error) {
        throw error;
      }

      setLinks((currentLinks) =>
        currentLinks.filter((link) => link.id !== linkToRemove.id)
      );
    } catch (error) {
      console.error("Error removing link:", error);
    }
  };
  const toggleTheme = async () => {
    const newTheme = resolvedTheme === "dark" ? "light-theme" : "dark";
    setTheme(newTheme);

    // Update the theme in Supabase only if the user is authenticated
    if (isAuthenticated && userId) {
      try {
        const { error } = await supabase
          .from("users")
          .update({ theme: newTheme })
          .eq("id", userId);

        if (error) {
          throw error;
        }
        console.log("Theme updated successfully in Supabase.");
      } catch (error) {
        console.error("Error updating theme in Supabase:", error);
      }
    }
  };
  return (
    <div className="flex h-screen px-4">
      {isAuthenticated && !isHalfAuthenticated ? (
        <>
          {/* Left Section for Authenticated User */}
          <div className="flex flex-col w-1/2 h-full p-4 space-y-6">
            <div className="flex items-center justify-start py-4">
              <button
                onClick={signOut}
                className="p-2 px-3 mx-3 btn btn-active btn-neutral"
              >
                Sign Out
              </button>
              <button onClick={toggleTheme} className="p-2">
                {resolvedTheme === "dark" ? (
                  <Image
                    src="/sun.png"
                    alt="Light Mode"
                    width={24}
                    height={24}
                  />
                ) : (
                  <Image
                    src="/moon.png"
                    alt="Dark Mode"
                    width={24}
                    height={24}
                  />
                )}
              </button>
            </div>
            <div className="flex flex-col p-4 space-y-5 h-full justify-center items-center">
              <ImageUploading
                multiple={false}
                value={images}
                onChange={onImageChange}
                maxNumber={1}
                dataURLKey="data_url"
              >
                {({
                  onImageUpload,
                  onImageRemoveAll,
                  dragProps,
                  isDragging,
                }) => (
                  <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      images.length > 0 && (
                        <img
                          src={images[0]["data_url"]}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      )
                    )}
                    {!profilePictureUrl && images.length === 0 && (
                      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    {images.length === 0 && !profilePictureUrl ? (
                      <button
                        className={`w-full text-white font-bold py-2 px-4 rounded ${
                          isDragging ? "bg-gray-600" : "bg-gray-700"
                        } focus:outline-none focus:shadow-outline border border-gray-600 hover:bg-gray-600`}
                        onClick={onImageUpload}
                        {...dragProps}
                      >
                        Click or Drag Image
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-active btn-primary mt-2"
                          onClick={uploadProfilePicture}
                        >
                          Upload
                        </button>
                        <button
                          className="btn btn-active btn-neutral mt-2"
                          onClick={() => {
                            removeProfilePicture();
                            onImageRemoveAll();
                          }}
                        >
                          Remove Image
                        </button>
                      </>
                    )}
                  </div>
                )}
              </ImageUploading>

              <div className="form-control w-full max-w-md mb-0">
                <label className="label">
                  <span className="label-text dark:text-white text-black">
                    Link Name
                  </span>
                </label>
                <input
                  type="text"
                  name="Title"
                  id="Title"
                  placeholder="Link Name"
                  className="input input-bordered w-full py-3"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label className="label">
                  <span className="label-text dark:text-white text-black">
                    URL
                  </span>
                </label>
                <input
                  type="text"
                  name="URL"
                  id="URL"
                  placeholder="URL"
                  className="input input-bordered w-full py-3 mb-5"
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-active btn-neutral mt-4"
                  onClick={addNewLink}
                >
                  Add Link
                </button>
              </div>
              <div className="w-full max-w-md p-4 bg-slate-700 rounded-lg">
                <div className="text-center mb-4 font-bold text-white">
                  Theme Selection
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    className="btn text-white bg-dark-500"
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </button>
                  <button
                    className="btn text-black bg-white"
                    onClick={() => setTheme("light-theme")}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section for Authenticated User */}
          <div className="flex flex-col w-1/2 h-full overflow-auto items-center p-4">
            <div className="flex flex-col flex-grow justify-center items-center">
              <div className="mb-6 self-center">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  images.length > 0 && (
                    <img
                      src={images[0]["data_url"]}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )
                )}
                {!profilePictureUrl && images.length === 0 && (
                  <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="w-full">
                {links?.map((link: Link, index: number) => (
                  <div className="flex items-center mb-3 group" key={index}>
                    <button
                      className="btn w-full px-10 text-white font-bold py-4 btn-wide rounded bg-slate-600 hover:bg-slate-700"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = link.URL;
                      }}
                    >
                      {link.Title}
                    </button>
                    <button
                      className="btn btn-square btn-outline ml-2 opacity-0 group-hover:opacity-100"
                      onClick={() => removeLink(link)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col w-full h-full overflow-auto items-center p-4 justify-center">
          {/* Profile Picture */}
          <div className="mb-6">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="w-full">
            {links?.map((link: Link, index: number) => (
              <div className="flex flex-col items-center mb-3" key={index}>
                <button
                  className="btn btn-wide px-10 text-white font-bold py-4 rounded bg-slate-600 hover:bg-slate-700"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = link.URL;
                  }}
                >
                  {link.Title}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
