import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-white ">
      <div className=" w-full rounded-[20px] ">
        <div className="flex h-full flex-col justify-between  gap-y-5 ">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold ">{time}</h1>
            <p className="text-base font-medium text-sky-1">{date}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold ">Video calls and meetings for everyone.</h1>
            <p className="text-lg font-medium text-sky-1 ">Connect, collaborate, and celebrate from anywhere.</p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
