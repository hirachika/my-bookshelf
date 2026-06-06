"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { auth, googleProvider } from "@/lib/firebase";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Session creation failed");
      router.push("/");
    } catch (e) {
      setError("ログインに失敗しました。もう一度お試しください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="orange.50">
      <Box
        bg="white"
        rounded="2xl"
        shadow="md"
        p="10"
        w="full"
        maxW="sm"
        textAlign="center"
      >
        <Box mb="6">
          <Heading as="h1" size="xl" color="orange.500" mb="2">
            My Bookshelf
          </Heading>
          <Text color="gray.500" fontSize="sm">
            あなただけの読書記録
          </Text>
        </Box>

        <Button
          onClick={handleGoogleSignIn}
          loading={loading}
          loadingText="ログイン中..."
          variant="outline"
          width="full"
          size="lg"
          gap="2"
          color="gray.700"
          borderColor="gray.200"
          _hover={{ bg: "gray.50" }}
        >
          <FcGoogle size={20} />
          Googleでログイン
        </Button>

        {error && (
          <Text color="red.500" fontSize="sm" mt="4">
            {error}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
