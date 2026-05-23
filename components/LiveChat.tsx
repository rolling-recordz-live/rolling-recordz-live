"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export default function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      setStatus(error.message);
      return;
    }

    setMessages(data || []);
  }

  async function sendMessage() {
    if (!text.trim()) return;

    setStatus("Sending...");

    const { error } = await supabase.from("chat_messages").insert({
      name: name.trim() || "Listener",
      message: text.trim(),
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setText("");
    setStatus("");
    await loadMessages();
  }

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("rolling-recordz-chat")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => loadMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    boxRef.current?.scrollTo({
      top: boxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="card h-[520px] flex flex-col">
      <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-2">COMMUNITY ROOM</p>
      <h2 className="text-3xl font-black mb-4">Live Chat</h2>

      <div
        ref={boxRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 rounded-2xl bg-black/20 border border-white/10 p-4"
      >
        {messages.length ? (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-2xl bg-black/25 border border-white/10 p-3">
              <p className="font-black text-[#ffd95a] text-sm">{msg.name}</p>
              <p className="text-white/80">{msg.message}</p>
            </div>
          ))
        ) : (
          <p className="text-white/50">No messages yet. Start the room.</p>
        )}
      </div>

      <div className="space-y-3 mt-auto">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4"
        />

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Send message..."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4"
        />

        <button onClick={sendMessage} className="btn w-full">
          Send
        </button>

        {status && (
          <p className="text-center text-sm text-[#ffd95a] font-bold">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
