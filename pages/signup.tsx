import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "./utils/SupaBaseClient";
import Image from "next/image";

export default function Signup() {
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [passwordShown, setPasswordShown] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  useEffect(() => {
    if (router.isReady && router.query.username) {
      setUsername(router.query.username as string);
    }
  }, [router.isReady, router.query.username]);

  async function signUpWithEmail() {
    try {
      if (!email || !password || !username) {
        alert("Please fill in all fields!");
        return;
      }

      const { data: usernameData, error: usernameError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (usernameError && usernameError.message !== "No rows found") {
        throw usernameError;
      }

      if (usernameData) {
        alert("Username already taken!");
        return;
      }

      const res = await supabase.auth.signUp({ email, password });
      if (res.error) throw res.error;

      const userId = res.data.user?.id;
      if (userId) {
        await createUser(userId, username);
        console.log("userId: ", userId);
        alert("Check your email for confirmation!");
      }
    } catch (error) {
      console.error("Error: ", error);
      alert("Error signing up!");
    }
  }

  async function createUser(userId: string, username: string) {
    try {
      const { error } = await supabase
        .from("users")
        .insert({ id: userId, username: username });
      if (error) throw error;
    } catch (error) {
      console.error("Error: ", error);
      alert("Could not create user profile.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 px-4">
      <h1 className="text-white font-bold text-3xl sm:text-4xl mb-6">
        Linkm.e
      </h1>
      <div className="form-control w-full max-w-md p-4">
        <label className="label">
          <span className="label-text text-white">Email</span>
        </label>
        <input
          type="text"
          placeholder="info@site.com"
          className="input input-bordered text-white w-full py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="username" className="label mt-4">
          <span className="label-text text-white">Username</span>
        </label>
        <input
          type="text"
          placeholder="username"
          className="input input-bordered text-white w-full py-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password" className="label mt-4">
          <span className="label-text text-white">Password</span>
        </label>
        <div className="relative">
          <input
            type={passwordShown ? "text" : "password"}
            placeholder="Password"
            className="input input-bordered text-white w-full py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            onClick={togglePasswordVisibility}
          >
            {passwordShown ? (
              <Image
                src="/noeye.png"
                alt="Hide Password"
                width={24}
                height={24}
              />
            ) : (
              <Image
                src="/eye.png"
                alt="Show Password"
                width={24}
                height={24}
              />
            )}
          </button>
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="btn btn-active btn-neutral px-10"
            onClick={signUpWithEmail}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
