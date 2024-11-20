import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";

export default function DashboardPage() {
  const [user] = useAuthState(auth);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="p-6 bg-gray-800">
        <h1 className="text-2xl">Welcome, {user?.displayName}</h1>
      </header>
      <main className="flex flex-col items-center justify-center flex-1 px-6">
        <Link
          href="/video-call"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg"
        >
          Start a New Call
        </Link>
      </main>
    </div>
  );
}
