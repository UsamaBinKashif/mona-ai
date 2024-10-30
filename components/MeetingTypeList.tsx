/* eslint-disable camelcase */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { generateMeetingLink } from '@/lib/helper';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import HomeCard from './HomeCard';
import Loader from './Loader';
import MeetingModal from './MeetingModal';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = generateMeetingLink();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  if (!client || !user) return <Loader />;

  return (
    <section className="grid lg:grid-cols-5 gap-10  ">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="border-2 border-[#5BC2AC] bg-transparent"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center justify-between"
        buttonText="Join Meeting"
        handleClick={() => router.push(`/meeting/${values.link}`)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="New Meeting"
        className="text-center justify-center"
        buttonText="Start Meeting"
        description="Start an instant meeting"
        img="/icons/add-meeting.svg"
        handleClick={createMeeting}
      />

    </section>
  );
};

export default MeetingTypeList;
