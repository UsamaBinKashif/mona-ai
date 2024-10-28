import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import axios from "axios"; // Import axios to make HTTP requests
import { storage } from "@/lib/firebase"; // Import your Firebase storage
import { API_URL } from "@/constants";

const FileUpload = ({ sender }: any) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const params = useParams();
    const roomId = params.id;
    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 50 * 1024 * 1024) { // 50MB limit
            setSelectedFile(file);
        } else {
            console.error("File is too large. Please upload files below 50MB.");
        }
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!selectedFile || !roomId) return;

        setUploading(true);
        const sanitizedFileName = selectedFile.name.replace(/\s+/g, '_');
        const storageRef = ref(storage, `uploads/${roomId}/${sanitizedFileName}`);

        try {
            // Step 1: Upload file to Firebase Storage
            const snapshot = await uploadBytes(storageRef, selectedFile);
            const fileURL = await getDownloadURL(snapshot.ref);

            console.log("File uploaded successfully, URL:", fileURL);

            // Step 2: Send file message to the backend
            await sendFileMessage(sanitizedFileName, fileURL);

            setUploading(false);
            setSelectedFile(null);
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error uploading file:", error);
            setSelectedFile(null);
            setUploading(false);
        }
    };

    // Function to send the file message to the backend via HTTP POST
    const sendFileMessage = async (fileName: string, fileURL: string) => {
        try {
            await axios.post(`${API_URL}/api/room/message`, {
                roomId,
                msg: `File: ${fileName}`, // Set the message with the file name
                fileURL, // Send the file URL
                sender, // Sender's name
            });
            console.log("File message sent successfully.");
        } catch (error) {
            console.error("Error sending file message:", error);
        }
    };

    return (
        <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        className="bg-transparent lg:hover:bg-blue-500 rounded-lg p-2 cursor-pointer"
                        title="upload-file"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Upload width={18} />
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                        <DialogDescription>Please upload files below 50MB.</DialogDescription>
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
                        <div className="flex flex-col lg:flex-row gap-x-5">
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
        </div>
    );
};

export default FileUpload;
