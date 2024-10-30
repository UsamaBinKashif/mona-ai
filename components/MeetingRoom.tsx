/* eslint-disable no-unused-vars */
'use client';
import {
  CallControls,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { LayoutList } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { ref, get, } from 'firebase/database';
import authContext from '@/auth/AuthContext';
import Chat from './Chat';
import EndCallButton from './EndCallButton';
import Loader from './Loader';
import Modal from './Modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { database } from '@/lib/firebase';
import { toast } from './ui/use-toast';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const roomID = params?.id;
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const { useCallCallingState } = useCallStateHooks();
  const { user, isUserLoggedIn } = useContext(authContext);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);


  useEffect(() => {
    const fetchParticipants = async (meetingId: string | string[]) => {
      if (!meetingId) {
        console.error("Meeting ID is required to fetch participants.");
        return;
      }

      try {
        const participantsRef = ref(database, `meetings/${meetingId}/participants`);
        const snapshot = await get(participantsRef);

        if (snapshot.exists()) {
          const participantsData = snapshot.val();
          const fetchedParticipants = Object.keys(participantsData).map((key) => ({
            id: key,
            ...participantsData[key],
          }));
          setParticipants(fetchedParticipants); // Update state with participants
        } else {
          console.log("No participants found.");
          setParticipants([]); // Clear state if no participants
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
        setParticipants([]); // Clear state on error
      }
    };

    fetchParticipants(roomID);
  }); // Add roomID to dependencies

  useEffect(() => {
    // Update participant names based on displayName
    participants.forEach(participant => {
      const participantNameDivs = document.querySelectorAll(`.str-video__participant-details__name`);

      participantNameDivs.forEach(participantNameDiv => {
        // Check if the text content matches userId, and if so, update it
        if (participantNameDiv?.textContent?.trim() === participant.userId) {
          participantNameDiv.childNodes[0].textContent = participant.displayName; // Update with displayName
        }
      });
    });
  });

  // console.log(user)
  // console.log(userDisplayName)
  /*
   ** **
   ** ** ** State
   ** **
   */
  useEffect(() => {
    setUserDisplayName(
      isUserLoggedIn && !user.isAnonymous
        ? user.name
        : localStorage.getItem('display-name') || '',
    );

  }, [user, isUserLoggedIn]);


  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full  pt-4 text-white overflow-hidden">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-5xl items-center  ">
          <CallLayout />
        </div>

      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center md:justify-center  flex-col  md:flex-row md:gap-5 md:px-6">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='flex gap-x-2'>

          <Modal />
          <Chat roomId={roomID as string} />
        {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
      {/* <div className='absolute bottom-20 left-[18%] bg-gray-500 text-black p-2 rounded-lg text-sm'>
        {userDisplayName}
      </div> */}
    </section>
  );
};

export default MeetingRoom;
