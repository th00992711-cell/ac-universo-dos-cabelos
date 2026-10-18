"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      richColors
      position="top-center"
      toastOptions={{ classNames: { toast: "!rounded-xl !font-sans" } }}
      {...props}
    />
  );
}

export { Toaster };
