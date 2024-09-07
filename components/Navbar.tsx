import { SignedIn, UserButton } from '@clerk/nextjs';
import Image from 'next/image';


const Navbar =  () => {

  return (
    <nav className='flex justify-between px-14 py-4'>
      <Image src="/images/monaai.png" alt="logo" width={112} height={20} className="w-[135px] h-[25px] " />
      <div >
        <SignedIn>
          <UserButton />
        </SignedIn>

      </div>
    </nav>
  );
};

export default Navbar;
