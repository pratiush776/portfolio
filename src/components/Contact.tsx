import { Github, Linkedin, Send } from "lucide-react";
import React from "react";
import Form from "next/form";

import Swal from "sweetalert2";
import Email from "./Email";

interface ContactProps {
  className?: string;
}

const Contact: React.FC<ContactProps> = ({ className }) => {
  async function handleSubmit(formData: FormData) {
    "use server";
    formData.append("access_key", "03c13abd-95f8-4f30-ba8d-db8e8c0cb6e4");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    });
    const result = await response.json();
    if (result.success) {
      Swal.fire({
        title: "Thank you for reaching out",
        text: "Message sent",
        icon: "success",
      });
    } else {
      Swal.fire({
        title: "Thank you for trying reaching out",
        text: "Fail to send the message",
        icon: "error",
      });
    }
  }

  return (
    <div className={`container z-5 flex flex-col justify-center ${className}`}>
      <div className="md:w-[40em] md:mx-auto md:flex md:flex-col translate-y-[2.5em]">
        <h1 className="title ">Contact</h1>
        <div
          // id="contact"
          className="p-[1rem] md:justify-self-start  md:h-[30em] bg-[#ffffff90] border-navy border-r-[4px] border-b-[4px] aspect-square flex flex-col items-center justify-center gap-[32px] md:gap-[44px] rounded-[20px] "
        >
          <div className="w-full text-navy flex flex-col gap-[12px] md:gap-[28px] items-center">
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
                type="submit"
                className="button !rounded-[20px] bg-navy opacity-90 text-beige "
              >
                <Send size={18} />
              </button>
            </Form>
          </div>
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
    </div>
  );
};

export default Contact;
