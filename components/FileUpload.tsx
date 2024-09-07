import { ref, uploadBytes } from "@firebase/storage";
import { getDownloadURL } from "firebase/storage";
import { ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useSocket } from "@/providers/SocketProvider";
import { storage } from "@/lib/firebase";

const FileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
    const { roomId } = useParams<{ roomId: string }>();
    const socket: any = useSocket();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !roomId) return;

        setUploading(true);
        const storageRef = ref(storage, `uploads/${roomId}/${selectedFile.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, selectedFile);
            const fileURL = await getDownloadURL(snapshot.ref);

            sendFileMessage(selectedFile.name, fileURL);

            setUploading(false);
            setSelectedFile(null);
            setIsDialogOpen(false); // Close the dialog after successful upload
        } catch (error) {
            setSelectedFile(null);
            console.error("Error uploading file:", error);
            setUploading(false);
        }
    };

    const sendFileMessage = (fileName: string, fileURL: string) => {
        socket.emit("BE-send-message", {
            roomId,
            msg: `File: ${fileName}`,
            fileURL,
        });
    };

    return (
        <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        className="bg-transparent lg:hover:bg-blue-500 rounded-lg p-2 cursor-pointer"
                        title="upload-file"
                        onClick={() => setIsDialogOpen(true)} // Open the dialog when clicked
                    >
                        <Upload width={15} />
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                        <DialogDescription>
                            Please upload files below 50MB.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="file-upload">Select File</Label>
                        <Input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}

                        />
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <div className="flex flex-col lg:flex-row">
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Close
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default FileUpload;