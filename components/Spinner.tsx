
const Spinner = () => {
    return (
        <div className="flex flex-row gap-2">
            <div className="w-1 h-1 rounded-full bg-[#5BC2AC] animate-bounce"></div>
            <div className="w-1 h-1 rounded-full bg-[#5BC2AC] animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-1 h-1 rounded-full bg-[#5BC2AC] animate-bounce [animation-delay:-.5s]"></div>
        </div>
    )
}

export default Spinner
