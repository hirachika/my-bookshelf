"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { IconButton } from "@chakra-ui/react";
import { RiLogoutBoxLine } from "react-icons/ri";
import { getFirebaseAuth } from "@/lib/firebase";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut(getFirebaseAuth());
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <IconButton
      onClick={handleSignOut}
      loading={loading}
      aria-label="ログアウト"
      variant="ghost"
      size="sm"
      color="white"
      _hover={{ bg: "orange.600" }}
    >
      <RiLogoutBoxLine />
    </IconButton>
  );
}
