"use client"
import { useChat } from "@/lib/context/chat-context";
import { useNavigation } from "@/lib/context/navigation-context";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useAI } from "@/lib/hooks/useAI";
import { DEFAULT_CHAT_TITLE } from "@/lib/constants";

// Custom Markdown renderers + spacing
type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};
const mdComponents: Components = {
  h1: (p) => <h1 className="mt-4 mb-2 text-2xl font-semibold" {...p} />,
  h2: (p) => <h2 className="mt-4 mb-2 text-xl font-semibold" {...p} />,
  h3: (p) => <h3 className="mt-4 mb-2 text-lg font-semibold" {...p} />,
  p: (p) => <p className="my-2 leading-7 whitespace-pre-wrap" {...p} />,
  ul: (p) => <ul className="my-2 list-disc pl-5 space-y-1" {...p} />,
  ol: (p) => <ol className="my-2 list-decimal pl-5 space-y-1" {...p} />,
  li: (p) => <li className="my-1" {...p} />,
  blockquote: (p) => (
    <blockquote className="my-3 border-l-2 pl-3 text-neutral-600 italic" {...p} />
  ),
  a: ({ href, ...p }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline hover:text-blue-700"
      {...p}
    />
  ),
  hr: (p) => <hr className="my-6 border-neutral-200" {...p} />,
  code: (props) => {
    const { inline, className, children, ...p } = props as CodeProps & ComponentPropsWithoutRef<'code'>;
    return inline ? (
      <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.9em]" {...p}>
        {children}
      </code>
    ) : (
      <pre className="my-3 overflow-x-auto rounded-md bg-neutral-900 p-3 text-neutral-100">
        <code className={className}>{children}</code>
      </pre>
    );
  },
};

// Loading dots component
const LoadingDots = () => (
  <div className="flex space-x-1 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  </div>
);

const ChatSessionPage = () => {
  const { slug } = useParams();
  const { title, messages, loadSessionMessages, setCurrentSession, loading, setTitle, clear } = useChat();
  const { summarize } = useAI();
  const { setActiveItem } = useNavigation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasSummarizedRef = useRef(false);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      setActiveItem(slug);
      loadSessionMessages(slug);
    }

    return () => {
      setActiveItem(null);
      clear();
      setCurrentSession(undefined);
    }
  }, [slug, loadSessionMessages, setActiveItem, setCurrentSession, clear]);

  // Auto-scroll to bottom when messages change and auto-title if needed
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }

    if (
      title === DEFAULT_CHAT_TITLE &&
      messages.length > 3 &&
      messages.some(m => m.role === 'assistant') &&
      !hasSummarizedRef.current
    ) {
      hasSummarizedRef.current = true;
      const text = messages.map(m => m.content).join('\n');
      summarize({ text })
        .then(({ summary }) => {
          if (summary && title === DEFAULT_CHAT_TITLE) {
            setTitle(summary);
          }
        })
        .catch(() => {})
        .finally(() => {
          // Allow future summarization if title remains New Chat and messages change significantly
          setTimeout(() => { hasSummarizedRef.current = false; }, 0);
        });
    }
  }, [messages, title, summarize, setTitle]);

  return (
    <div ref={scrollContainerRef} className="w-full h-full overflow-y-scroll">
      <div className="w-full flex flex-col flex-1 mt-10 space-y-10 max-w-[var(--thread-max-width)] mx-auto">
        {messages.length && messages.map((message) => (
          <div key={message.id} className={cn("flex", {
            "justify-end w-full": message.role === "user"
          })}>
            <div key={message.id} className={cn("", {
              "bg-neutral-100 px-4 py-2 rounded-4xl": message.role === "user",
            })}>
              {message.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-pre:my-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {/* Show loading indicator when waiting for AI response */}
        {loading && (
          <div className="flex justify-start w-full">
            <LoadingDots />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatSessionPage;