import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "./utils/SupaBaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };
  async function signInWithEmail() {
    try {
      if (email && password) {
        const res = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (res.error) throw res.error;
        {
          const userId = res.data.user?.id;
          console.log("userId: ", userId);
          router.push("/");
        }
      }
    } catch {}
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
          className="input input-bordered w-full py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="label mt-4">
          <span className="label-text text-white">Password</span>
        </label>
        <div className="relative">
          <input
            type={passwordShown ? "text" : "password"}
            placeholder="Password"
            className="input input-bordered w-full py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            onClick={togglePasswordVisibility}
          >
            {passwordShown ? "Hide" : "Show"}
          </button>
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="btn btn-active btn-neutral px-10"
            onClick={signInWithEmail}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
