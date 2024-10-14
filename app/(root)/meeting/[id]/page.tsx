'use client';

// React / Next
import { useParams } from 'next/navigation';
import { useContext, useState } from 'react';

// Third party libs
import { Loader } from 'lucide-react';

// App
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';

// Components
import Alert from '@/components/Alert';
import MeetingRoom from '@/components/MeetingRoom';
import MeetingSetup from '@/components/MeetingSetup';

// Hooks
import authContext from '@/auth/AuthContext';
import { useGetCallById } from '@/hooks/useGetCallById';

/*
 ** ** ===============================================================================
 ** ** ** Page [MeetingPage]
 ** ** ===============================================================================
 */

 const initialCountries = [
  {
    flag: 'https://flagcdn.com/w320/gb.png', // United Kingdom flag (for English)
    languages: ['English'],
  },
  {
    flag: 'https://flagcdn.com/w320/es.png', // Spain flag (for Spanish)
    languages: ['Spanish'],
  },
  {
    flag: 'https://flagcdn.com/w320/fr.png', // France flag (for French)
    languages: ['French'],
  },
  {
    flag: 'https://flagcdn.com/w320/de.png', // Germany flag (for German)
    languages: ['German'],
  },
  {
    flag: 'https://flagcdn.com/w320/it.png', // Italy flag (for Italian)
    languages: ['Italian'],
  },
  {
    flag: 'https://flagcdn.com/w320/pt.png', // Portugal flag (for Portuguese)
    languages: ['Portuguese (European)', 'Portuguese (Brazilian)'],
  },
  {
    flag: 'https://flagcdn.com/w320/nl.png', // Netherlands flag (for Dutch)
    languages: ['Dutch'],
  },
  {
    flag: 'https://flagcdn.com/w320/ru.png', // Russia flag (for Russian)
    languages: ['Russian'],
  },
  {
    flag: 'https://flagcdn.com/w320/cn.png', // China flag (for Chinese)
    languages: ['Chinese (Simplified)', 'Chinese (Traditional)'],
  },
  {
    flag: 'https://flagcdn.com/w320/jp.png', // Japan flag (for Japanese)
    languages: ['Japanese'],
  },
  {
    flag: 'https://flagcdn.com/w320/kr.png', // South Korea flag (for Korean)
    languages: ['Korean'],
  },
  {
    flag: 'https://flagcdn.com/w320/sa.png', // Saudi Arabia flag (for Arabic)
    languages: ['Arabic (Modern Standard)'],
  },
  {
    flag: 'https://flagcdn.com/w320/tr.png', // Turkey flag (for Turkish)
    languages: ['Turkish'],
  },
  {
    flag: 'https://flagcdn.com/w320/in.png', // India flag (for Hindi)
    languages: ['Hindi'],
  },
  {
    flag: 'https://flagcdn.com/w320/bd.png', // Bangladesh flag (for Bengali)
    languages: ['Bengali'],
  },
  {
    flag: 'https://flagcdn.com/w320/pk.png', // Pakistan flag (for Urdu)
    languages: ['Urdu'],
  },
  {
    flag: 'https://flagcdn.com/w320/lk.png', // Sri Lanka flag (for Tamil)
    languages: ['Tamil'],
  },
  {
    flag: 'https://flagcdn.com/w320/vn.png', // Vietnam flag (for Vietnamese)
    languages: ['Vietnamese'],
  },
  {
    flag: 'https://flagcdn.com/w320/th.png', // Thailand flag (for Thai)
    languages: ['Thai'],
  },
  {
    flag: 'https://flagcdn.com/w320/ir.png', // Iran flag (for Persian/Farsi)
    languages: ['Persian (Farsi)'],
  },
  {
    flag: 'https://flagcdn.com/w320/gr.png', // Greece flag (for Greek)
    languages: ['Greek'],
  },
  {
    flag: 'https://flagcdn.com/w320/pl.png', // Poland flag (for Polish)
    languages: ['Polish'],
  },
  {
    flag: 'https://flagcdn.com/w320/ua.png', // Ukraine flag (for Ukrainian)
    languages: ['Ukrainian'],
  },
  {
    flag: 'https://flagcdn.com/w320/ro.png', // Romania flag (for Romanian)
    languages: ['Romanian'],
  },
  {
    flag: 'https://flagcdn.com/w320/il.png', // Israel flag (for Hebrew)
    languages: ['Hebrew'],
  },
  {
    flag: 'https://flagcdn.com/w320/se.png', // Sweden flag (for Swedish)
    languages: ['Swedish'],
  },
  {
    flag: 'https://flagcdn.com/w320/no.png', // Norway flag (for Norwegian)
    languages: ['Norwegian'],
  },
  {
    flag: 'https://flagcdn.com/w320/dk.png', // Denmark flag (for Danish)
    languages: ['Danish'],
  },
  {
    flag: 'https://flagcdn.com/w320/fi.png', // Finland flag (for Finnish)
    languages: ['Finnish'],
  },
  {
    flag: 'https://flagcdn.com/w320/cz.png', // Czech Republic flag (for Czech)
    languages: ['Czech'],
  },
  {
    flag: 'https://flagcdn.com/w320/hu.png', // Hungary flag (for Hungarian)
    languages: ['Hungarian'],
  },
  {
    flag: 'https://flagcdn.com/w320/rs.png', // Serbia flag (for Serbian)
    languages: ['Serbian'],
  },
  {
    flag: 'https://flagcdn.com/w320/bg.png', // Bulgaria flag (for Bulgarian)
    languages: ['Bulgarian'],
  },
  {
    flag: 'https://flagcdn.com/w320/hr.png', // Croatia flag (for Croatian)
    languages: ['Croatian'],
  },
  {
    flag: 'https://flagcdn.com/w320/my.png', // Malaysia flag (for Malay/Indonesian)
    languages: ['Malay', 'Indonesian'],
  },
  {
    flag: 'https://flagcdn.com/w320/ph.png', // Philippines flag (for Filipino/Tagalog)
    languages: ['Filipino (Tagalog)'],
  },
  {
    flag: 'https://flagcdn.com/w320/kh.png', // Cambodia flag (for Khmer)
    languages: ['Khmer'],
  },
  {
    flag: 'https://flagcdn.com/w320/la.png', // Laos flag (for Lao)
    languages: ['Lao'],
  },
  {
    flag: 'https://flagcdn.com/w320/np.png', // Nepal flag (for Nepali)
    languages: ['Nepali'],
  },
  {
    flag: 'https://flagcdn.com/w320/mm.png', // Myanmar flag (for Burmese)
    languages: ['Burmese (Myanmar)'],
  },
  {
    flag: 'https://flagcdn.com/w320/ke.png', // Kenya flag (for Swahili)
    languages: ['Swahili'],
  },
  {
    flag: 'https://flagcdn.com/w320/so.png', // Somalia flag (for Somali)
    languages: ['Somali'],
  },
  {
    flag: 'https://flagcdn.com/w320/et.png', // Ethiopia flag (for Amharic)
    languages: ['Amharic'],
  },
  {
    flag: 'https://flagcdn.com/w320/az.png', // Azerbaijan flag (for Azerbaijani)
    languages: ['Azerbaijani'],
  },
  {
    flag: 'https://flagcdn.com/w320/ge.png', // Georgia flag (for Georgian)
    languages: ['Georgian'],
  },
  {
    flag: 'https://flagcdn.com/w320/am.png', // Armenia flag (for Armenian)
    languages: ['Armenian'],
  },
  {
    flag: 'https://flagcdn.com/w320/mn.png', // Mongolia flag (for Mongolian)
    languages: ['Mongolian'],
  },
];

const MeetingPage = () => {
  /*
   ** **
   ** ** ** State
   ** **
   */
  const { user, isUserLoggedIn, isLoading } = useContext(authContext);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const [countries, setCountries] = useState(initialCountries);
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
