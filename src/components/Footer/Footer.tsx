import Container from '@/components/Container';

const Footer = () => {
  return (
    <footer className="mt-12">
      <Container className="p-6">
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Built with <a className="underline font-medium text-inherit" href="https://cloudinary.com/?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=footer_builtwith">Cloudinary</a> &amp; <a className="underline font-medium text-inherit" href="https://nextjs.org/">Next.js</a> by <a className="underline font-medium text-inherit" href="https://twitter.com/colbyfayock">Colby Fayock</a>
        </p>
      </Container>
    </footer>
  );
}

export default Footer;