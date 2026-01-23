"use client";
import { Check, Github, Linkedin, Plus, Send } from "lucide-react";
import React, { useEffect } from "react";
import Form from "next/form";
import Email from "./Email";
import { motion } from "framer-motion";
import { AnimatePresence } from "motion/react";
import { pierSans } from "@/lib/fonts";

interface ContactProps {
  className?: string;
}

const Contact: React.FC<ContactProps> = ({ className }) => {
  const [status, setStatus] = React.useState("default");

  async function handleSubmit(formData: FormData) {
    if (status === "loading") return;
    setStatus("loading");
    setTimeout(async () => {
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      const response = await fetch("/api/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });
      const result = await response.json();
      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          setStatus("default");
        }, 4000);
      } else {
        setStatus("error");
        setTimeout(() => {
          setStatus("default");
        }, 4000);
      }
    }, 1000);
  }

  return (
    <div className={`container z-5 flex flex-col justify-center ${className}`}>
      <div className="md:w-[40em] md:mx-auto md:flex md:flex-col translate-y-[2.5em] md:gap-[16px] ">
        <h1 className={`title  ${pierSans.className}`}>Contact</h1>
        <div
          // id="contact"
          className=" float-animation relative md:justify-self-start  md:h-[30em] border-1  border-navy border-r-[4px] border-b-[4px] aspect-square flex flex-col items-center justify-center gap-[32px] md:gap-[44px] rounded-[20px] "
        >
          <div className="p-[1rem] bg-[#8d99aec2] -translate-[8px] rounded-[20px] h-full w-full text-navy flex flex-col gap-[12px] md:gap-[28px] items-center justify-center">
            <h3 className="p  opacity-[80%]">send me a message</h3>
            <Form
              action={handleSubmit}
              className="flex flex-col gap-[16px] w-full md:w-[27em] md:gap-[20px] items-center text-[12px]"
            >
              <input
                className="w-[70%] border-[#00000047] border-1 bg-beige rounded-[20px] px-[16px] py-[8px] placeholder:text-gray-500 placeholder:italic font-medium"
                type="text"
                name="name"
                placeholder="name"
                required
              />
              <input
                className="w-[70%] border-[#00000047] border-1 bg-beige rounded-[20px] px-[16px] py-[8px] placeholder:text-gray-500 placeholder:italic font-medium"
                type="email"
                name="email"
                placeholder="email"
                required
              />
              <textarea
                className="w-[70%] border-[#00000047] border-1 bg-beige rounded-[20px] px-[16px] py-[8px] placeholder:text-gray-500 placeholder:italic font-medium resize-none"
                name="message"
                placeholder="message"
                required
              />
              <button
                id="submit"
                type="submit"
                style={{
                  backgroundColor:
                    status === "success"
                      ? " #008000"
                      : status === "error"
                        ? "#950606"
                        : "#001f3f",
                  transition: "background-color 0.3s ease-out",
                }}
                className="button !rounded-[20px] opacity-90 text-beige border border-[#00000047] flex items-center justify-center gap-[8px] px-4 py-2"
              >
                <AnimatePresence mode="wait">
                  {status === "default" && (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0, scale: 0.8, x: 0 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 100 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Send size={18} />
                    </motion.span>
                  )}
                  {status === "loading" && (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <span className="loading loading-spinner loading-xs !h-[18px]"></span>
                    </motion.span>
                  )}
                  {status === "success" && (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check size={18} color="white" />
                    </motion.span>
                  )}
                  {status === "error" && (
                    <motion.span
                      key="error"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus size={18} className="rotate-45" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </Form>
            <div className="flex gap-[8px] md:gap-[16px]">
              <Email className="border-navy hover:bg-navy hover:text-beige border-1 transition-all ease-out" />
              <a
                href={"https://www.linkedin.com/in/pratiush-k-810324223"}
                target="_blank"
                className="flex flex-col items-center gap-0 "
              >
                <button className="button border-[#00000047] hover:bg-navy hover:text-beige border-1 transition-all ease-out bg-beige text-navy !rounded-[20px]">
                  <Linkedin size={18} />
                </button>
              </a>
              <a
                href={"https://github.com/pratiush776"}
                target="_blank"
                className="flex flex-col items-center gap-0"
              >
                <button className="button border-[#00000047] hover:bg-navy hover:text-beige border-1 transition-all ease-out bg-beige text-navy !rounded-[20px]">
                  <Github size={18} />
                </button>
              </a>
            </div>
          </div>
        </div>
        <div className="float-shadow w-full h-[1em] absolute bottom-[-3em] bg-[#4a464634] rounded-[100%]  blur-xs "></div>
      </div>
    </div>
  );
};

export default Contact;
