import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Video Calling App</h1>
        <p className="text-gray-400">Connect with friends and colleagues effortlessly.</p>
        <button
          onClick={loginWithGoogle}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
