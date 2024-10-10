'use client';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useContext, useEffect, useState } from 'react';

import authContext from '@/auth/AuthContext';
import Alert from './Alert';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';


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
  setCountries,
}: MeetingSetupProps) => {
  const { user, isUserLoggedIn } = useContext(authContext);
  const [displayName, setDisplayName] = useState('');

  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const [language, setLanguage] = useState<string>(''); // Correctly define language state and its setter


  useEffect(() => {
    localStorage.setItem('currentUserLanguage', language);
  }, [language]);

  const call = useCall();

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

  const handleInputChange = (text: string) => {
    setDisplayName(text);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
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
      <div className="flex gap-x-5">
        <Button
          className="rounded-md bg-[#5BC2AC] px-4 py-2.5"
          onClick={() => {
            if (isUserLoggedIn && user.isAnonymous && !displayName)
              return alert('Please set a name before joining the meeting.');

            window.localStorage.setItem(
              'display-name',
              user.isAnonymous ? displayName : user.name,
            );

            call.join();
            setIsSetupComplete(true);
          }}
        >
          Join meeting
        </Button>

        <Select onValueChange={setLanguage}>
          <SelectTrigger className="col-span-3 border-[#5BC2AC] text-black">
            <SelectValue placeholder="Select your language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {countries.map((country, index) => (
                <SelectItem
                  key={index}
                  value={`${country.languages[0]}-${index}`} // Making the value unique by adding the index
                >
                  <img
                    src={country.flag}
                    alt="flag"
                    className="inline-block mr-2 w-6 h-4"
                  />
                  {country.languages[0]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>

          {isUserLoggedIn === true && user.isAnonymous === true && (
            <input
              className="text-black text-sm px-2 rounded-lg border"
              type="text"
              placeholder="Your Name"
              onChange={(e) => handleInputChange(e.target.value)}
            />
          )}
        </Select>
      </div>
    </div>
  );
};

export default MeetingSetup;
