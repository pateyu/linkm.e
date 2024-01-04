import { useState, FormEvent } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/signup?username=${encodeURIComponent(username)}`);
  };

  const handleLogin = () => {
    router.push("/signup");
  };

  const handleLogout = () => {};

  const handleSignup = () => {
    router.push("/signup");
  };

  const handleProfile = () => {
    router.push("/");
  };

  return (
    <div className="bg-slate-900 text-white">
      <div className="flex justify-center py-4 sticky top-0 z-50">
        <nav className="flex items-center bg-white rounded-full mt-5 px-6 py-2 w-4/6 space-x-4">
          <h2 className="text-3xl font-bold text-slate-700 flex-shrink-0">
            Linkm.e
          </h2>
          <div className="flex-grow"></div>
          {isAuthenticated ? (
            <>
              <button
                onClick={handleProfile}
                className="btn btn-active btn-ghost"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-active btn-ghost"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSignup}
                className="btn btn-active bg-slate-700"
              >
                Sign up
              </button>
              <button
                onClick={handleLogin}
                className="btn btn-active bg-slate-700"
              >
                Login
              </button>
            </>
          )}
        </nav>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-10 py-8">
        <div className="w-full md:w-2/5 mb-8 md:mb-0 text-center md:text-left">
          <h1 className="text-8xl font-bold mb-6">
            The One Link To Rule Them All
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center my-10 md:items-start"
          >
            <div className="flex w-2/3 mt-8 md:w-1/3 border-2 border-white bg-white text-black rounded-full overflow-hidden">
              <span className="pl-6 pr-1 py-2">linkm.e/</span>
              <input
                type="text"
                placeholder="username"
                className="flex-1 bg-transparent rounded-r-full focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex w-1/3 justify-center mt-4">
              <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold bg-white text-slate-900 rounded-full hover:bg-slate-200"
              >
                Claim your Linkm.e
              </button>
            </div>
          </form>
          <p className="text-lg mt-10 w-1/2 font-bold">
            Use Linkm.e to share all your social media profiles, music, stores,
            websites, and anything that is YOU with one link. And, the best part
            is, wait for it ... it's completely FREE!
          </p>
        </div>
      </div>
    </div>
  );
}
