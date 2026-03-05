"use client";

import { useRouter } from "next/navigation";
import { Conversations } from "./components/Conversations";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  if (!user) {
    router.push("/login");
    return null;
  }
  return <Conversations />;
}
