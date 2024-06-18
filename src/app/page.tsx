import Link from 'next/link';

import Section from '@/components/Section';
import Container from '@/components/Container';
import WidgetUpload from '@/components/WidgetUpload';
import CldImage from '@/components/CldImage';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div className="mt-4 md:mt-20 mb-12 md:mb-24">
      <Section>
        <Container>
          <WidgetUpload className="mb-12 md:mb-36" />

          <h1 className="text-5xl font-black text-center mb-6">
            Optimize Your Images for Free
          </h1>

          <p className="text-xl text-center">
            Easily optimize and compress your images to help improve performance. <strong>All free!</strong>
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mt-20 md:mt-36 mx-auto">
            <li>
              <CldImage
                className="block rounded-lg shadow-lg"
                src="assets/imgtoxyz-quality-compression_wqtda6"
                width="900"
                height="600"
                alt="Donut with icing and sprinkles"
                sizes="100vw"
              />
              <h2 className="font-bold text-2xl text-center mt-8">
                Compress Images
              </h2>
              <p className="text-center mt-4">
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
              <h2 className="font-bold text-2xl text-center mt-8">
                Convert Format
              </h2>
              <p className="text-center mt-4">
                Use modern image formats for more efficient, reduced file sizes.
              </p>
            </li>
          </ul>

          <h2 className="font-black text-4xl text-center mt-24 md:mt-36 mb-8">
            How Does it Work?
          </h2>

          <p className="text-center text-xl max-w-2xl mb-8 mx-auto">
            imgto.xyz uses <Link href="/developer-api">Cloudinary&apos;s Image API</Link> to
            easily optimize and convert
            your image to modern, efficient formats.
          </p>

          <p className="text-center max-w-sm mt-8 mb-8 mx-auto">
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

          <h2 className="font-black text-4xl text-center mt-24 md:mt-36 mb-8">
            Optimize Your Images
          </h2>

          <p className="text-center text-xl max-w-2xl mb-8 mx-auto">
            Head back to the top and get started optimizing your images for free!
          </p>

          <p className="text-center">
            <Button href="#" size="lg">
              Get Started
            </Button>
          </p>
        </Container>
      </Section>
    </div>
  )
}
