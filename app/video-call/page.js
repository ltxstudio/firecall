"use client";

import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { db } from "../../lib/firebase";
import { collection, addDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone } from "react-icons/fa";

export default function VideoCallPage() {
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callId, setCallId] = useState("");
  const [mute, setMute] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const startStream = async () => {
    const userStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(userStream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = userStream;
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    setPeer(newPeer);
  };

  const joinCall = async () => {
    const callDoc = doc(db, "calls", callId);
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    setPeer(newPeer);
  };

  useEffect(() => {
    startStream();
  }, []);

  const toggleMute = () => {
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
      setMute(!mute);
    }
  };

  const toggleVideo = () => {
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks[0].enabled = !videoTracks[0].enabled;
      setVideoOff(!videoOff);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="p-6 bg-gray-800 text-center">
        <h1 className="text-2xl">Video Call</h1>
        {callId && (
          <p className="text-gray-400 mt-2">
            Share this Call ID with a friend: <span className="text-blue-400">{callId}</span>
          </p>
        )}
      </header>
      <main className="flex flex-1 items-center justify-center gap-6 px-6">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 bg-gray-700 rounded-lg" />
        <video ref={remoteVideoRef} autoPlay className="w-1/2 bg-gray-700 rounded-lg" />
      </main>
      <footer className="p-6 bg-gray-800 flex justify-center gap-6">
        <button onClick={toggleMute} className="p-3 bg-red-500 rounded-full shadow-lg">
          {mute ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button onClick={toggleVideo} className="p-3 bg-blue-500 rounded-full shadow-lg">
          {videoOff ? <FaVideoSlash /> : <FaVideo />}
        </button>
        <button className="p-3 bg-gray-700 rounded-full shadow-lg">
          <FaPhone />
        </button>
      </footer>
    </div>
  );
}
