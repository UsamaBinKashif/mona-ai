"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
  description?: string;
  img?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  instantMeeting,
  image,
  buttonClassName,
  buttonIcon,
  description,
  img,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`flex w-[350px]  rounded-lg  lg:w-[520px] flex-col gap-6 border-none px-6 py-9 text-white ${title === "New Meeting" ? "bg-[#5BC2AC]" : "bg-dark-1"}`}>
        {title === "New Meeting" ? (
          <section
            className={cn(
              "bg-[#5BC2AC] mx-auto pishtu  px-4 py-6 flex flex-col  w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer",
              className
            )}
            onClick={handleClick}
          >

            <div className="flex flex-col   items-center gap-2">
              {img && (
                <div className="flex-center glassmorphism size-12 rounded-[10px]">
                  <Image src={img} alt="meeting" width={27} height={27} />
                </div>
              )}
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-lg font-normal">{description}</p>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-6">
            {image && (
              <div className="flex justify-center">
                <Image src={image} alt="checked" width={72} height={72} />
              </div>
            )}
            <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
              {title}
            </h1>
            {children}
            <Button
              className={
                "bg-[#5BC2AC] focus-visible:ring-0 focus-visible:ring-offset-0 border-0 outline-none"
              }
              onClick={handleClick}
            >
              {buttonIcon && (
                <Image
                  src={buttonIcon}
                  alt="button icon"
                  width={13}
                  height={13}
                />
              )}{" "}
              &nbsp;
              {buttonText || "Schedule Meeting"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog >
  );
};

export default MeetingModal;
