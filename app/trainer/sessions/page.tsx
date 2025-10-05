"use client";

import { NormalLoader } from "@/components/modules/general/loader";
import SessionDashboard from "@/components/modules/pages/trainer/sessions/session-dashboard";

import { Session, Tag } from "@/prisma/generated/prisma";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTags, setSessionTags] = useState<Tag[]>([]);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setisLoading(true);
      try {
        const response = await axios.get("/api/auth/trainer/session");
        // console.log("SessionData", response.data.sessions);
        setSessions(response.data.sessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setisLoading(false);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      {isLoading ? (
        <NormalLoader />
      ) : (
        <SessionDashboard sessions={sessions} sessionTags={sessionTags} />
      )}
    </>
  );
};

export default SessionsPage;
