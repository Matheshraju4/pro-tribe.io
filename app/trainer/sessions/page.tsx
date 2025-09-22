"use client";

import SessionDashboard from "@/components/modules/pages/trainer/sessions/session-dashboard";

import { Session, Tag } from "@/prisma/generated/prisma";
import { Suspense, useState } from "react";

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTags, setSessionTags] = useState<Tag[]>([]);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionDashboard sessions={sessions} sessionTags={sessionTags} />
    </Suspense>
  );
};

export default SessionsPage;
