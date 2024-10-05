import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="flex justify-between px-14 py-4">
      <Image
        src="/images/monaai.png"
        alt="logo"
        width={112}
        height={20}
        className="h-[25px] w-[135px]"
      />
    </nav>
  );
};

export default Navbar;
