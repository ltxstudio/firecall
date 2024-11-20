import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaVideo, FaPhone, FaCopy } from "react-icons/fa";
import SimplePeer from "simple-peer";
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, doc, setDoc } from "firebase/firestore";

export default function VideoCall() {
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callId, setCallId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const videoRef = useRef();
  const remoteRef = useRef();

  const startStream = async () => {
    const userStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(userStream);
    if (videoRef.current) {
      videoRef.current.srcObject = userStream;
    }
  };

  const startCall = async () => {
    const newPeer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    newPeer.on("signal", async (data) => {
      const docRef = await addDoc(collection(db, "calls"), { offer: data });
      setCallId(docRef.id);
    });

    newPeer.on("stream", (remoteStream) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = remoteStream;
      }
    });

    setPeer(newPeer);
  };

  const joinCall = async (id) => {
    const callDoc = doc(db, "calls", id);
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data.answer) {
        peer.signal(data.answer);
      }
    });

    const newPeer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    newPeer.on("signal", async (data) => {
      await setDoc(callDoc, { answer: data }, { merge: true });
    });

    newPeer.on("stream", (remoteStream) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = remoteStream;
      }
    });

    setPeer(newPeer);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(callId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-xl mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-48 bg-gray-800 rounded-lg"
        />
        <video
          ref={remoteRef}
          autoPlay
          className="w-full h-48 bg-gray-800 rounded-lg"
        />
      </div>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <button
          onClick={startStream}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
        >
          <FaVideo /> Start Camera
        </button>
        <button
          onClick={startCall}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow"
        >
          <FaPhone /> Start Call
        </button>
      </div>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <input
          type="text"
          placeholder="Enter Call ID"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none"
        />
        <button
          onClick={() => joinCall(callId)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg shadow"
        >
          <FaPhone /> Join Call
        </button>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow"
        >
          <FaCopy /> Copy Call ID
        </button>
        {isCopied && <p className="text-green-500 mt-2">Copied to clipboard!</p>}
      </div>
    </motion.div>
  );
}
