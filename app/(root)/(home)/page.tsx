'use client';

import { useContext, useEffect, useState } from 'react';

import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';

// Components
import Loader from '@/components/Loader';
import MeetingTypeList from '@/components/MeetingTypeList';
import LoginForm from '@/components/LoginForm';
import authContext from '@/auth/AuthContext';

/*
 ** ** ===================================================================================================
 ** ** ** Component [Home]
 ** ** ===================================================================================================
 */
const Home = () => {
  /*
   ** **
   ** ** ** State & Vars
   ** **
   */
  const { isUserLoggedIn, isLoading } = useContext(authContext);

  // State for time and date
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    // Function to update time and date
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDate(new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(now));
    };

    // Update time immediately and set interval to update every second
    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);


  /*
   ** **
   ** ** ** Methods
   ** **
   */

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      alert('Something went wrong, please try logging out again');
    }
  };

  // Display loader until user status is set
  if (isLoading) return <Loader />;

  // Display login form if user is not signed in
  if (!isUserLoggedIn) return <LoginForm />;

  return (
    <section className="flex size-full flex-col gap-5 text-white ">
      <button
        className="absolute right-4 top-4 bg-red-500 text-white w-[140px] h-[40px] rounded-sm"
        onClick={handleLogout}
      >
        Logout
      </button>
      <div className=" w-full rounded-[20px] ">
        <div className="flex h-full flex-col justify-between  gap-y-5 ">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold ">{time}</h1>
            <p className="text-base font-medium text-sky-1">{date}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold ">
              Video calls and meetings for everyone.
            </h1>
            <p className="text-lg font-medium text-sky-1 ">
              Connect, collaborate, and celebrate from anywhere.
            </p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
