/* eslint-disable tailwindcss/no-contradicting-classname */
/* eslint-disable no-unsafe-optional-chaining */
import { API_URL } from "@/constants";
import { useSocket } from "@/providers/SocketProvider";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { MessageCircleX, MessageSquareText, Mic, SendHorizontal } from "lucide-react";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import Recorder from "recorder-js";
import Spinner from "./Spinner";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import FileUpload from "./FileUpload";

interface Props {
  roomId: string;
  setChatBox?: (state: boolean) => void;
  fileURL?: string; // Add this property
}
interface Message {
  msg: string;
  sender: string;
  fileURL?: string; // Add this property
}

interface AudioMessage {
  sender: string;
  audioUrl: string;
}

const Chat = ({ roomId, setChatBox }: Props) => {
  const { isLoaded, isSignedIn, user } = useUser();



  const currentUser = user?.fullName
  const socket: any = useSocket();
  const [msg, setMsg] = useState<Message[]>([]);
  const [audioMsgs, setAudioMsgs] = useState<AudioMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<number, string>>({});
  const [translatedAudioMessages, setTranslatedAudioMessages] = useState<Record<number, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [loadingAudioStates, setLoadingAudioStates] = useState<Record<number, boolean>>({});
  const language = localStorage.getItem("currentUserLanguage")?.split("-")[0] || "Mongolian";
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recorder = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    socket?.on("FE-receive-message", ({ msg, sender, fileURL }: Message) => {
      setMsg((msgs) => [{ sender, msg, fileURL }, ...msgs]);
    });

    socket?.on("FE-receive-audio", ({ audioUrl, sender }: AudioMessage) => {
      setAudioMsgs((audioMsgs) => [{ sender, audioUrl }, ...audioMsgs]);
    });

    return () => {
      socket?.off("FE-receive-message");
      socket?.off("FE-receive-audio");
    };
  }, [socket, roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${roomId}`);
        const data = response.data;
        // console.log(data)
        setMsg(data.messages.reverse()); // Reverse messages to show latest first
        setAudioMsgs(data.audioMessages.reverse()); // Reverse audio messages
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };


    fetchMessages();
  }, [roomId, msg]);

  useEffect(() => {
    scrollToBottom();
  }, [msg, audioMsgs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    let msg = "";

    if ("key" in e && e.key === "Enter") {
      msg = (e.currentTarget as HTMLInputElement).value;
    } else if ("type" in e && e.type === "click") {
      msg = inputRef.current?.value || "";
    }

    if (msg && user) {
      socket.emit("BE-send-message", { roomId, msg, sender: currentUser }); // Use the user's first name
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    audioContext.current = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
    recorder.current = new Recorder(audioContext.current);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder.current.init(stream);
    recorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    try {
      toast({
        title: "Sending Audio",
      });

      // Stop recording and get the blob (assuming the blob format is webm)
      const { blob } = await recorder?.current?.stop();

      // Ensure the blob is valid before proceeding
      if (!blob) {
        console.error("No audio data available.");
        return;
      }

      // Convert the blob into a file (adjust the format if necessary)
      const audioFile = new File([blob], "recording.webm", { type: "audio/webm" });

      // Convert the file to ArrayBuffer to be sent via socket
      const arrayBuffer = await audioFile.arrayBuffer();

      // Emit the audio data to the backend
      socket.emit("BE-send-audio", {
        roomId,
        audioBlob: arrayBuffer,  // ArrayBuffer of the recorded audio
        sender: currentUser,     // Name of the sender (e.g., user's name)
      });

      // Set recording state back to false after completion
      setIsRecording(false);
    } catch (error) {
      console.error("An error occurred during stop recording:", error);
      setIsRecording(false);
    }
  };

  const handleTranslate = async (msg: string, index: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [index]: true }));
      const response = await axios.post(`${API_URL}/api/translate`, { language: language, content: msg });

      if (response.status === 200) {
        setTranslatedMessages((prev) => ({ ...prev, [index]: response.data.translatedText }));
      } else {
        console.error("Translation error:", response.data.error);
        toast({
          title: "Failed to translate the message.",
        })

      }
    } catch (error) {
      console.error("Error during translation:", error);
      toast({
        title: "An error occurred during translation.",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleTranslateAudio = async (audioUrl: string, index: number) => {
    try {
      setLoadingAudioStates((prev) => ({ ...prev, [index]: true }));
      const response = await axios.post(`${API_URL}/api/translate-audio`, { language: language, audioUrl: audioUrl });

      if (response.status === 200) {
        setTranslatedAudioMessages((prev) => ({ ...prev, [index]: response.data.translatedText }));
      } else {
        console.error("Translation error:", response.data.error);
        toast({
          title: "Failed to translate the message.",
        })

      }
    } catch (error) {
      console.error("Error during translation:", error);
      // toast("An error occurred during translation.");
    } finally {
      setLoadingAudioStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleDownload = (fileURL: any) => {
    const link = document.createElement("a");
    link.href = fileURL;
    link.setAttribute("download", "filename.ext");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stringToColor = (string: string = '') => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
  };

  if (!isLoaded) {
    return <p>Loading...</p>; // Display a loading message while the user data is being fetched
  }

  if (!isSignedIn) {
    return <p>Please sign in to continue.</p>; // Handle the case when the user is not signed in
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}

      >
        <MessageSquareText className='size-6 cursor-pointer' />
      </button>
      {showModal ? (
        <div className="fixed  right-0 top-0 text-white p-2 lg:p-5  bg-[#1A2131]  lg:w-[354px] h-screen     overflow-hidden">
          <div className="flex justify-between items-center ">
            <img
              src="/images/monaai.png"
              alt="logo"
              className="w-[112px] h-[20px] "
            />

            <button
              type="button"
              onClick={() => setShowModal(false)}
            >
              <MessageCircleX color="white" />
            </button>
          </div>
          {/* <h1 className="text-2xl lg:text-3xl">MONA AI</h1> */}
          <div className=" h-[90%] my-5 overflow-y-scroll w-full  scrollbar-hide">
            <div>
              <>

                {msg.slice().reverse().map(({ sender, msg, fileURL, timestamp }: any, index: number) => (
                  <div className={`flex items-start  gap-2.5 my-6 ${sender === currentUser ? "self-end" : ""}`} key={index}>
                    <div className="flex flex-col w-[250px] lg:w-[300px] text-white leading-1.5 p-[2px]">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="text-sm font-semibold" style={{ color: stringToColor(sender) }}>{sender}</span>
                        <span className="text-sm font-light text-[10px]">{moment(timestamp).format("h:mm A")}</span>
                      </div>
                      <p className="text-sm font-light py-[6px] text-[16px]">
                        {msg && msg.includes("https") ? (
                          <audio controls src={msg} className="" id="audio"></audio>
                        ) : (
                          msg
                        )}
                        {fileURL && (
                          <button
                            onClick={() => handleDownload(fileURL)}
                            className="text-secondary-upperground mx-2 uppercase"
                          >
                            Download
                          </button>
                        )}
                      </p>
                      {msg && msg.includes("https") ? (
                        <button
                          className="flex text-white text-[14px] items-center gap-2"
                          onClick={() => handleTranslateAudio(msg, index)}
                        >
                          <img src="/images/translate.png" alt="logo" className="size-3 cursor-pointer" />
                          {loadingAudioStates[index] ? (
                            <Spinner />
                          ) : (
                            <>{translatedAudioMessages[index] || `translate into ${language}`}</>
                          )}
                        </button>
                      ) : (
                        <button
                          className="flex text-white text-[14px] items-center gap-2"
                          onClick={() => handleTranslate(msg, index)}
                        >
                          <img src="/images/translate.png" alt="logo" className="size-3 cursor-pointer" />
                          {loadingStates[index] ? (
                            <Spinner />
                          ) : (
                            <>{translatedMessages[index] || `translate into ${language}`}</>
                          )}
                        </button>
                      )}


                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />

              </>
            </div>
          </div>
          <div className="flex gap-2 absolute bottom-0 lg:bottom-4 items-center">
            <div className="flex border-2 border-secondary-upperground items-center bg-transparent rounded-xl">
              <Input
                type="text"
                name="text"
              

                className="text-[#9D9FA5] bg-[#1A2131] rounded-xl "
                ref={inputRef}
                onKeyDown={sendMessage}
                placeholder="Enter your message"
              />
            </div>
              <div
                onMouseDown={toggleRecording}
                title="record-audio"
                className={
                  isRecording
                    ? " animate-pulse p-2 bg-green-500  hover:bg-green-400"
                    : "bg-transparent p-2 cursor-pointer rounded-lg   hover:bg-green-400"
                }
              >
                <Mic width={15} />
              </div>
              <FileUpload sender={currentUser} />
            <button
              title="send-text"
              onClick={sendMessage}
              className="lg:bg-secondary-upperground lg:hover:bg-secondary-upperground/50 lg:w-[46px] flex items-center justify-center h-[40px] rounded-xl"
            >
              <SendHorizontal />
            </button>
          </div>
        </div>) : null}

    </>
  );
};

export default Chat;
