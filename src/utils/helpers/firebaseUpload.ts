import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../filebaseConfig";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Helper function to extract filename from Firebase URL
export const extractFilenameFromUrl = (url: string): string | null => {
  try {
    // Firebase URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{folder}%2F{filename}?alt=media&token={token}
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    const encodedPath = pathname.split('/o/')[1]
    if (!encodedPath) return null
    
    const decodedPath = decodeURIComponent(encodedPath)
    const filename = decodedPath.split('/').pop()
    
    return filename || null
  } catch (error) {
    console.error('Error extracting filename from URL:', error)
    return null
  }
}

// upload image
export const uploadImage = async (file: File, folder: string) => {
  const storageRef = ref(storage, `${folder}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

export const uploadCourseImage = async (file: File) => {
  return uploadImage(file, "courseImage");
};

export const fallbackCoursesImages = [
  "https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/courseImage%2FcourseImage_fallback1.png?alt=media&token=daa6c640-923e-445e-8a0b-6cc0385a4c93",
  "https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/courseImage%2FcourseImage_fallback2.png?alt=media&token=22b2309f-9cee-40ac-b3cb-326203a875d1"
];

export const uploadCertificateImage = async (file: File) => {
  return uploadImage(file, "certificateImage");
};

export const uploadSpeakerImage = async (file: File) => {
  return uploadImage(file, "speakerImage");
};

export const uploadProgramImage = async (file: File) => {
  return uploadImage(file, "programImage");
}

export const uploadBlogImage = async (file: File) => {
  return uploadImage(file, "blogImage");
};

// delete image
export const deleteImage = async (folder: string, fileName: string) => {
  const fileRef = ref(storage, `${folder}/${fileName}`);
  try {
    await deleteObject(fileRef);
    console.log(`File ${fileName} deleted successfully from ${folder}`);
  } catch (error) {
    console.error(`Error deleting file ${fileName} from ${folder}:`, error);
  }
}

export const deleteCourseImage = async (fileName: string) => {
  return deleteImage("courseImage", fileName);
};

export const deleteCertificateImage = async (fileName: string) => {
  return deleteImage("certificateImage", fileName);
};

export const deleteSpeakerImage = async (fileName: string) => {
  return deleteImage("speakerImage", fileName);
};

export const deleteProgramImage = async (fileName: string) => {
  return deleteImage("programImage", fileName);
};

export const deleteBlogImage = async (fileName: string) => {
  return deleteImage("blogImage", fileName);
};

// Upload user avatar
export const uploadUserAvatar = async (file: File) => {
  return uploadImage(file, "userAvatar");
};