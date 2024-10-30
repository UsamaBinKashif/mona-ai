/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-redeclare */
import React, { useContext, useEffect, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import authContext from '@/auth/AuthContext';
import Alert from './Alert';
import { Button } from './ui/button';
import { DisplayNameContext } from '@/providers/DisplayNameContext';
import { database } from '@/lib/firebase';
import { useParams } from 'next/navigation';
import { ref, set } from 'firebase/database';
interface Country {
  flag: string;
  languages: string[];
}

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
  countries: Country[];
  setCountries: (value: Country[]) => void;
}

const MeetingSetup = ({
  setIsSetupComplete,
  countries,
}: MeetingSetupProps) => {
  const { user, isUserLoggedIn } = useContext(authContext);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();
  const { displayName, setDisplayName } = useContext(DisplayNameContext);
  const [localDisplayName, setLocalDisplayName] = useState(displayName || '');
  const params = useParams()
  const handleInputChange = (text: string) => {
    setLocalDisplayName(text);
    setDisplayName(text);  // Update the context value
  };


  const saveUserToRealtimeDatabase = async () => {
    if (params.id && user && localDisplayName) {
      try {
        await set(ref(database, `meetings/${params.id}/participants/${user.id}`), {
          displayName: localDisplayName,
          userId: user.id,
        });
      } catch (error) {
        console.error("Error saving user to Realtime Database:", error);
      }
    }
  };

  useEffect(() => {
    const videoDisabledDiv = document.querySelector('.str_video__video-preview__disabled-video-preview');

    if (videoDisabledDiv) {
      videoDisabledDiv.textContent = 'Camera is off';
    }
  }); // Run on component mount


  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem('currentUserLanguage', selectedLanguage);
    }
  }, [selectedLanguage]);

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );


  // Custom options for react-select
  const countryOptions = countries.map((country, index) => ({
    value: country.languages[0],
    label: (
      <div className="flex items-center">
        <img src={country.flag} alt="flag" className="inline-block mr-2 w-6 h-4" />
        {country.languages[0]}
      </div>
    ),
  }));
  const mongolianOption = countryOptions.find(option => option.value === 'Mongolian');

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        <label className="flex items-center justify-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <div className="flex flex-col lg:flex-row gap-5 items-center">
        <Button
          className="rounded-md bg-[#5BC2AC] px-4 py-2.5"
          onClick={async () => {
            if (isUserLoggedIn && user.isAnonymous && !displayName)
              return alert('Please set a name before joining the meeting.');

            window.localStorage.setItem(
              'display-name',
              user.isAnonymous ? displayName : user.name,
            );

            await saveUserToRealtimeDatabase();  // Save user info to Realtime Database
            call.join();
            setIsSetupComplete(true);
          }}
        >
          Join meeting
        </Button>

        <div className="w-64">

          <Select
            options={countryOptions}
            onChange={(option: SingleValue<{ value: string }>) => setSelectedLanguage(option?.value || '')}
            className="text-black"
            defaultValue={mongolianOption} // Set Mongolian as the default
          />
        </div>

        {isUserLoggedIn === true && user.isAnonymous === true && (
          <input
            className="text-black text-sm p-2 rounded-lg border"
            type="text"
            placeholder="Your Name"
            value={localDisplayName}  // Set the value to the local display name
            onChange={(e) => handleInputChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingSetup;
