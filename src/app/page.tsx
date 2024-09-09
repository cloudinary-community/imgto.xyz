import Link from "next/link";

import Button from "@/components/Button";
import CldImage from "@/components/CldImage";
import Container from "@/components/Container";

import Section from "@/components/Section";
import WidgetUpload from "@/components/WidgetUpload";

export default function Home() {
  return (
    <div className="mt-4 mb-12 md:mt-20 md:mb-24">
      <Section>
        <Container>
          <WidgetUpload className="mb-12 md:mb-36" />

          <h1 className="mb-6 text-center font-black text-5xl">
            Optimize Your Images for Free
          </h1>

          <p className="text-center text-xl">
            Easily optimize and compress your images to help improve
            performance. <strong>All free!</strong>
          </p>

          <ul className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-12 sm:grid-cols-2 md:mt-36">
            <li>
              <CldImage
                className="block rounded-lg shadow-lg"
                src="assets/imgtoxyz-quality-compression_wqtda6"
                width="900"
                height="600"
                alt="Donut with icing and sprinkles"
                sizes="100vw"
              />
              <h2 className="mt-8 text-center font-bold text-2xl">
                Compress Images
              </h2>
              <p className="mt-4 text-center">
                Optimize images to help reduce file size and boost performance.
              </p>
            </li>
            <li>
              <CldImage
                className="block rounded-lg shadow-lg"
                src="assets/imgtoxyz-format-converter_obubig"
                width="900"
                height="600"
                alt="Colorful umbrellas with AVIF format in corner"
                sizes="100vw"
              />
              <h2 className="mt-8 text-center font-bold text-2xl">
                Convert Format
              </h2>
              <p className="mt-4 text-center">
                Use modern image formats for more efficient, reduced file sizes.
              </p>
            </li>
          </ul>

          <h2 className="mt-24 mb-8 text-center font-black text-4xl md:mt-36">
            How Does it Work?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-center text-xl">
            imgto.xyz uses{" "}
            <Link href="/developer-api">Cloudinary&apos;s Image API</Link> to
            easily optimize and convert your image to modern, efficient formats.
          </p>

          <p className="mx-auto mt-8 mb-8 max-w-sm text-center">
            <a href="https://cloudinary.com?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=home_logo">
              <CldImage
                className="w-full"
                src="assets/cloudinary-blue_mtkkjm"
                width="468"
                height="92"
                alt="Cloudinary logo"
                format="svg"
              />
            </a>
          </p>

          <h2 className="mt-24 mb-8 text-center font-black text-4xl md:mt-36">
            Optimize Your Images
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-center text-xl">
            Head back to the top and get started optimizing your images for
            free!
          </p>

          <p className="text-center">
            <Button href="#" size="lg">
              Get Started
            </Button>
          </p>
        </Container>
      </Section>
    </div>
  );
}
