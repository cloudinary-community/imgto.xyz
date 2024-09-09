import CldImage from "@/components/CldImage";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import Section from "@/components/Section";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <article className="prose-xl grid gap-0 prose-p:mt-0 prose-pre:mt-0 prose-blockquote:mt-0">
            <PageTitle>How to Use</PageTitle>

            <p>
              imgto.xyz is a tool that allows you to quickly and easily optimize
              your images for web and mobile devices.
            </p>

            <p>
              To get started, upload your file on the homepage whether selecting
              the file from your local filesystem or dragging it directly into
              the application.
            </p>

            <p className="max-w-xl mx-auto">
              <CldImage
                className="block shadow rounded-lg overflow-hidden"
                src="assets/imgtoxyz-upload-image-file_xnw8dd"
                width="800"
                height="600"
                alt="Uploading a file to imgto.xyz"
                sizes="100vw"
              />
            </p>

            <p>
              And that&apos;s it! Once uploaded, we&apos;ll quickly optimize
              your image, giving you the ability to download it in the format
              you uploaded in or alternatively download it in other popular
              formats, such as WebP, AVIF, and JXL.
            </p>

            <p>
              Learn more about <Link href="/developer-api">how it works</Link>!
            </p>
          </article>
        </Container>
      </Section>
    </div>
  );
}
