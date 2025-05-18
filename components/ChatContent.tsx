"use client";

import { useUser } from "@clerk/nextjs";
import CodeContent from "./CodeContent";
import Avatar from "./Avatar";

const ChatContent = ({
  message,
  isPending,
}: {
  message: any[];
  isPending: boolean;
}) => {
  const { user } = useUser();

  return (
    <div className="mb-7">
      {message.map(
        (
          { role, content }: { role: string; content: string },
          index: number
        ) => {
          const bcg = role === "user" ? "bg-base-200" : "bg-base-100";

          return (
            <div
              key={index}
              className={`${bcg} flex py-4 -mx-8 px-8 text-lg leading-loose border-b border-base-300 items-start`}
            >
              <Avatar
                role={role as "user" | "assistant"}
                user={user ? { imageUrl: user.imageUrl } : undefined}
              />
              <CodeContent
                content={content}
                role={role}
                isPending={isPending}
              />
            </div>
          );
        }
      )}

      {isPending ? (
        <div className="flex items-center justify-center h-screen">
          <span className="loading "></span>
        </div>
      ) : null}
    </div>
  );
};

export default ChatContent;
