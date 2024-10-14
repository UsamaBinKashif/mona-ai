"use client"
import { API_URL } from "@/constants";
// import { API_URL } from "@/constants";
import React, { createContext, useMemo, useContext } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export const useSocket = () => {
    const { socket } = useContext(SocketContext);
    return socket
}

export const SocketProvider: React.FC<React.PropsWithChildren<object>> = (props) => {
    const socket = useMemo(() => io(API_URL), []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {props.children}
        </SocketContext.Provider>
    );
};