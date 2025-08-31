"use client";

import { Session } from "@/prisma/generated/prisma";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SessionDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  return (
    <>
      {sessions?.length > 0 ? (
        <div>
          {sessions.map((session) => (
            <div key={session.id}>{session.sessionName}</div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen gap-3">
          <div>No sessions found</div>
          <Link href="/trainer/sessions/create">
            <Button>Create Session</Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default SessionDashboard;
