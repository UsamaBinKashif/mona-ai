'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

import { Copy } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const params = useParams()


  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: 'Link Copied',
        });
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
      <div className='flex gap-x-3'>
        <Button onClick={endCall} className="bg-red-500">
          End call for everyone
        </Button>
        <div onClick={handleCopy} className='text-[12px] flex items-center gap-x-2 p-2 mb-2 rounded-lg justify-between cursor-pointer' >
          {params.id}
          <Copy />
        </div>
      </div>
    </>
  );
};

export default EndCallButton;
