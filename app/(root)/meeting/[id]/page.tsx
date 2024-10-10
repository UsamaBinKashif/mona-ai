'use client';

// React / Next
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Third party libs
import { Loader } from 'lucide-react';

// App
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';

// Components
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';

// Hooks
import { useGetCallById } from '@/hooks/useGetCallById';
import authContext from '@/auth/AuthContext';
import { getCountries } from '@/lib/helper';

/*
 ** ** ===============================================================================
 ** ** ** Page [MeetingPage]
 ** ** ===============================================================================
 */
const MeetingPage = () => {
  /*
   ** **
   ** ** ** State
   ** **
   */
  const { user, isUserLoggedIn, isLoading } = useContext(authContext);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [countries, setCountries] = useState<
    { flag: string; languages: string[] }[]
  >([]);


  useEffect(() => {
    const fetchCountries = async () => {
      const countryData = await getCountries();
      setCountries(countryData);
    };
    fetchCountries();
  }, []);
  const { id } = useParams();
  const { call, isCallLoading } = useGetCallById(id);

  if (isLoading || isCallLoading) return <Loader />;

  if (!call)
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );

  const notAllowed =
    call.type === 'invited' &&
    (!isUserLoggedIn || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed)
    return <Alert title="You are not allowed to join this meeting" />;



  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} countries={countries} setCountries={setCountries} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
