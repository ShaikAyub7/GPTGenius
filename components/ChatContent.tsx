"use client";

import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import { SiOpenaigym } from "react-icons/si";

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
          const avatar =
            role === "user" ? (
              <span className="text-xl">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    className="w-6 h-6 rounded-full mt-2"
                    alt="User avatar"
                  />
                ) : (
                  "👤"
                )}
              </span>
            ) : (
              <SiOpenaigym className="w-6 h-6 text-primary mt-2" />
            );

          const bcg = role === "user" ? "bg-base-200" : "bg-base-100";

          return (
            <div
              key={index}
              className={`${bcg} flex py-4 -mx-8 px-8 text-lg leading-loose border-b border-base-300 items-start`}
            >
              <span className="mr-4">{avatar}</span>
              <div className="prose max-w-3xl">
                <ReactMarkdown
                  components={{
                    code({ children }) {
                      const code = String(children).trim();
                      return (
                        <div className="mockup-code text-sm w-full my-2">
                          {code.split("\n").map((line, i) => (
                            <pre key={i} data-prefix={i + 1}>
                              <code>{line}</code>
                            </pre>
                          ))}
                        </div>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          );
        }
      )}

      {isPending ? <span className="loading loading-dots"></span> : null}
    </div>
  );
};

export default ChatContent;
