import { useState, useEffect } from "react";
import {
  getProfileDataAction,
  updateProfileAction,
} from "@/actions/profileActions";
import { useRouter } from "next/navigation";

type UserProfile = {
  name?: string | null;
  profileImageUrl?: string | null;
  [key: string]: unknown;
};

export function useProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileDataAction();
        setUserProfile(data);
        setEditName(data.name || "");
        setEditImage(data.profileImageUrl || "");
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateProfileAction({
        name: editName,
        profileImageUrl: editImage,
        password: editPassword,
      });

      setMessage({ type: "success", text: result.message });
      setEditPassword("");

      setUserProfile((prev) => ({
        ...(prev ?? {}),
        name: editName,
        profileImageUrl: editImage,
      }));

      router.refresh();
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: (error as Error).message || "Erro ao atualizar perfil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    userProfile,
    isLoading,
    editName,
    setEditName,
    editImage,
    setEditImage,
    editPassword,
    setEditPassword,
    isSaving,
    message,
    handleUpdateProfile,
  };
}
