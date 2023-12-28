import { use, useEffect, useState } from "react";
import supabase from "./utils/SupaBaseClient";
import ImageUploading, { ImageListType } from "react-images-uploading";
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
  const [images, setImages] = useState<ImageListType>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<
    string | undefined
  >();

  const onImageChange = (imageList: ImageListType) => {
    setImages(imageList);
  };

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

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("profile_picture_url")
          .eq("id", userId);
        if (error) throw error;
        const profilePictureUrl = data[0].profile_picture_url;
        setProfilePictureUrl(profilePictureUrl);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    if (userId) {
      getUser();
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
        if (links) {
          setLinks([...data, ...links]);
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
  return (
    <div className="flex h-screen bg-gray-900 px-4">
      {isAuthenticated && (
        <div className="flex flex-col w-1/2 h-full p-4 justify-center items-center space-y-6">
          {/* Left section: Image Upload Section */}
          <ImageUploading
            multiple={false}
            value={images}
            onChange={onImageChange}
            maxNumber={1}
            dataURLKey="data_url"
          >
            {({ onImageUpload, onImageRemoveAll, dragProps, isDragging }) => (
              <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4">
                {/* Display the profile picture or a placeholder */}
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

                {/* Conditional Rendering of Buttons */}
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
                      onClick={onImageRemoveAll}
                    >
                      Remove Image
                    </button>
                  </>
                )}
              </div>
            )}
          </ImageUploading>

          {/* Form for adding links */}
          <div className="form-control w-full max-w-md">
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
            <label className="label">
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
            <button
              type="button"
              className="btn btn-active btn-neutral mt-4"
              onClick={addNewLink}
            >
              Add Link
            </button>
          </div>
        </div>
      )}

      {/* Right section: Section for displaying profile picture and links */}
      <div className="flex flex-col w-1/2 h-full overflow-auto items-center p-4">
        {/* Profile Picture at the top */}
        <div className="mt-4 mb-6">
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

        {/* Container for links */}
        <div className="flex-grow flex flex-col justify-center items-center">
          {links?.map((link: Link, index: number) => (
            <div
              className="text-white font-bold text-xl mb-6 cursor-pointer"
              key={index}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = link.URL;
              }}
            >
              {link.Title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
