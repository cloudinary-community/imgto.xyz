import Container from "@/components/Container";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-12">
      <Container className="p-6">
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Built with{" "}
          <a
            className="underline font-medium text-inherit"
            href="https://cloudinary.com/?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=footer_builtwith"
          >
            Cloudinary
          </a>{" "}
          &amp;{" "}
          <a
            className="underline font-medium text-inherit"
            href="https://nextjs.org/"
          >
            Next.js
          </a>{" "}
          by{" "}
          <a
            className="underline font-medium text-inherit"
            href="https://twitter.com/colbyfayock"
          >
            Colby Fayock
          </a>{" "}
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;{" "}
          <a
            className="inline-flex items-center gap-1 font-medium text-inherit align-middle"
            href="https://github.com/cloudinary-community/imgto.xyz"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
