/* eslint-disable tailwindcss/no-contradicting-classname */
/* eslint-disable no-unsafe-optional-chaining */
import { API_URL } from '@/constants';
import axios from 'axios';
import {
  MessageCircleX,
  MessageSquareText,
  Mic,
  SendHorizontal,
} from 'lucide-react';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Recorder from 'recorder-js';
import Spinner from './Spinner';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';
import FileUpload from './FileUpload';
import authContext from '@/auth/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface Props {
  roomId: string;
  setChatBox?: (state: boolean) => void;
  fileURL?: string;
}

interface Message {
  msg: string;
  sender: string;
  fileURL?: string;
}

interface AudioMessage {
  sender: string;
  audioUrl: string;
}

const Chat = ({ roomId, setChatBox }: Props) => {
  /*
   ** State
   */
  const { user, isLoading, isUserLoggedIn } = useContext(authContext);
  const [userDisplayName, setUserDisplayName] = useState('');

  useEffect(() => {
    setUserDisplayName(
      isUserLoggedIn && !user.isAnonymous
        ? user.name
        : localStorage.getItem('display-name') || '',
    );
  }, [user, isUserLoggedIn]);

  const [msg, setMsg] = useState<Message[]>([]);
  const [audioMsgs, setAudioMsgs] = useState<AudioMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<
    Record<number, string>
  >({});
  const [translatedAudioMessages, setTranslatedAudioMessages] = useState<
    Record<number, string>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {},
  );
  const [loadingAudioStates, setLoadingAudioStates] = useState<
    Record<number, boolean>
  >({});
  const language =
    localStorage.getItem('currentUserLanguage')?.split('-')[0] || 'Mongolian';
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recorder = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);

  /*
   ** Effects
   */

  // Fetch messages from the backend when the component is mounted
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${roomId}`);
        const data = response.data;
        setMsg(data.messages.reverse()); // Reverse messages to show latest first
        setAudioMsgs(data.audioMessages.reverse()); // Reverse audio messages
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Polling for new messages every 5 seconds
    const messagePolling = setInterval(fetchMessages, 5000);

    // Cleanup polling on component unmount
    return () => clearInterval(messagePolling);
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [msg, audioMsgs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    let message = '';

    if ('key' in e && e.key === 'Enter') {
      message = (e.currentTarget as HTMLInputElement).value;
    } else if ('type' in e && e.type === 'click') {
      message = inputRef.current?.value || '';
    }

    if (message && isUserLoggedIn) {
      try {
        toast({
          title: 'Sending Message',
        });
        await axios.post(`${API_URL}/api/room/message`, {
          roomId,
          msg: message,
          sender: userDisplayName,
        });

        // Clear input field
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error sending message:', error);
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
    audioContext.current = new ((window.AudioContext ||
      (window as any).webkitAudioContext) as typeof AudioContext)();
    recorder.current = new Recorder(audioContext.current);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder.current.init(stream);
    recorder.current.start();
    setIsRecording(true);
  };

  const uploadAudioToFirebase = async (audioBlob: Blob, userDisplayName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `audio/${Date.now()}-${userDisplayName}.webm`);

      // Upload the audio blob to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, audioBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Optional: You can track upload progress here
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('Error uploading audio to Firebase:', error);
          reject(error);
        },
        async () => {
          // Get the public URL once the upload is complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const stopRecording = async () => {
    try {
      toast({
        title: 'Sending Audio',
      });

      const { blob } = await recorder?.current?.stop();
      if (!blob) {
        console.error('No audio data available.');
        return;
      }

      // Step 1: Upload the audio to Firebase Storage
      const audioUrl = await uploadAudioToFirebase(blob, userDisplayName);
      console.log('Audio uploaded, URL:', audioUrl);

      // Step 2: Send the URL to your backend to store it in the message
      await axios.post(`${API_URL}/api/room/audio`, {
        roomId,
        audioUrl,  
        sender: userDisplayName,
      });

      setIsRecording(false);
    } catch (error) {
      console.error('An error occurred during stop recording:', error);
      setIsRecording(false);
    }
  };




  const handleTranslate = async (msg: string, index: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [index]: true }));
      const response = await axios.post(`${API_URL}/api/translate`, {
        language,
        content: msg,
      });

      if (response.status === 200) {
        setTranslatedMessages((prev) => ({
          ...prev,
          [index]: response.data.translatedText,
        }));
      } else {
        console.error('Translation error:', response.data.error);
        toast({
          title: 'Failed to translate the message.',
        });
      }
    } catch (error) {
      console.error('Error during translation:', error);
      toast({
        title: 'An error occurred during translation.',
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleTranslateAudio = async (audioUrl: string, index: number) => {
    try {
      setLoadingAudioStates((prev) => ({ ...prev, [index]: true }));
      const response = await axios.post(`${API_URL}/api/translate-audio`, {
        language,
        audioUrl,
      });

      if (response.status === 200) {
        setTranslatedAudioMessages((prev) => ({
          ...prev,
          [index]: response.data.translatedText,
        }));
      } else {
        console.error('Translation error:', response.data.error);
        toast({
          title: 'Failed to translate the message.',
        });
      }
    } catch (error) {
      console.error('Error during translation:', error);
    } finally {
      setLoadingAudioStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleDownload = (fileURL: any) => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.setAttribute('download', 'filename.ext');
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

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please sign in to continue.</p>;
  }

  return (
    <>
      <button type="button" onClick={() => setShowModal(true)}>
        <MessageSquareText className="size-6 cursor-pointer" />
      </button>
      {showModal ? (
        <div className="fixed right-0 top-0 text-white p-2 lg:p-5 bg-[#1A2131] w-[354px] h-screen overflow-hidden">
          <div className="flex justify-between items-center">
            <img
              src="/images/monaai.png"
              alt="logo"
              className="w-[112px] h-[20px]"
            />
            <button type="button" onClick={() => setShowModal(false)}>
              <MessageCircleX color="white" />
            </button>
          </div>
          <div className="h-[90%] my-5 overflow-y-scroll w-full scrollbar-hide">
            <div>
              {msg
                .slice()
                .reverse()
                .map(({ sender, msg, fileURL, timestamp }: any, index: number) => (
                  <div
                    className={`flex items-start gap-2.5 my-6 ${sender === userDisplayName ? 'self-end' : ''
                      }`}
                    key={index}
                  >
                    <div className="flex flex-col w-[250px] lg:w-[300px] text-white leading-1.5 p-[2px]">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: stringToColor(sender) }}
                        >
                          {sender}
                        </span>
                        <span className="text-sm font-light text-[10px]">
                          {moment(timestamp).format('h:mm A')}
                        </span>
                      </div>
                      <p className="text-sm font-light py-[6px] text-[16px]">
                        {msg && msg.includes('https') ? (
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
                      {msg && msg.includes('https') ? (
                        <button
                          className="flex text-white text-[14px] items-center gap-2"
                          onClick={() => handleTranslateAudio(msg, index)}
                        >
                          <img
                            src="/images/translate.png"
                            alt="logo"
                            className="size-3 cursor-pointer"
                          />
                          {loadingAudioStates[index] ? <Spinner /> : <>{translatedAudioMessages[index] || `translate into ${language}`}</>}
                        </button>
                      ) : (
                        <button
                          className="flex text-white text-[14px] items-center gap-2"
                          onClick={() => handleTranslate(msg, index)}
                        >
                          <img
                            src="/images/translate.png"
                            alt="logo"
                            className="size-3 cursor-pointer"
                          />
                          {loadingStates[index] ? <Spinner /> : <>{translatedMessages[index] || `translate into ${language}`}</>}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="flex gap-2 absolute bottom-0 lg:bottom-4 items-center">
            <div className="flex border-1 border-secondary-upperground items-center bg-transparent rounded-xl">
              <Input
                type="text"
                name="text"
                className="text-[#9D9FA5] bg-[#1A2131] rounded-xl"
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
                  ? 'animate-pulse p-2 bg-green-500 hover:bg-green-400'
                  : 'bg-transparent p-2 cursor-pointer rounded-lg hover:bg-green-400'
              }
            >
              <Mic width={18} />
            </div>
            <FileUpload sender={userDisplayName}  />
            <button
              title="send-text"
              onClick={sendMessage}
              className="lg:bg-secondary-upperground lg:hover:bg-secondary-upperground/50 lg:w-[46px] flex items-center justify-center h-[40px] rounded-xl"
            >
              <SendHorizontal />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Chat;
