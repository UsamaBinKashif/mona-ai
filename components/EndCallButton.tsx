'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

import { Button } from './ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import { useState } from 'react';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const params = useParams()

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    router.push('/');
  };

  return (
    <>
      <div>
        <div onClick={handleCopy} className='text-[12px] flex items-center gap-x-2 p-2 mb-2 rounded-lg justify-between cursor-pointer' >
          {params.id}
          {copied && <span className="text-white text-[10px] ml-2">Copied!</span>} <Copy />
        </div>
        <Button onClick={endCall} className="bg-red-500">
          End call for everyone
        </Button>
      </div>
    </>
  );
};

export default EndCallButton;
