import SessionDashboard from "@/components/modules/pages/trainer/sessions/session-dashboard";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

const SessionsPage = async () => {
  const sessions = await prisma.session.findMany({
    where: {
      trainerId: "d8f1ba28-9fdc-4ad9-a5a4-c438ee2133d4",
    },
  });
  const sessionTags = await prisma.tag.findMany({
    where: {
      sessionId: {
        in: sessions.map((session) => session.id),
      },
    },
  });
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionDashboard sessions={sessions} sessionTags={sessionTags} />
    </Suspense>
  );
};

export default SessionsPage;
