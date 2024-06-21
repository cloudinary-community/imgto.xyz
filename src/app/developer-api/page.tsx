import Section from '@/components/Section';
import Container from '@/components/Container';
import PageTitle from '@/components/PageTitle';
import CldImage from '@/components/CldImage';

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <article className="prose-xl grid prose-p:mt-0 prose-pre:mt-0 prose-blockquote:mt-0">
            <PageTitle>Developer API</PageTitle>
            
            <p>
              Everything on imgto.xyz is built using <a href="https://cloudinary.com/?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_cloudinarysuite">Cloudinary&apos;s</a> suite
              of <a href="https://cloudinary.com/developers?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_apis">developer APIs</a>.
            </p>

            <p>
              This goes beyond optimization, like transformations such
              as <a href="https://cloudinary.com/image-api?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_transformations">dynamic cropping and resizing and background removal</a> as
              well as <a href="https://cloudinary.com/products/cloudinary_ai?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_ai">AI workflows</a> like content analysis and moderation.
            </p>

            <p>
              By signing up for a free Cloudinary account, you can instantly gain access to the same APIs and
              more Cloudinary tech, including a <a href="https://cloudinary.com/video_api?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_video">video API</a> and
              an <a href="https://cloudinary.com/products/digital_asset_management?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_dam">industry-leading DAM</a> (Digital Asset Manager).
            </p>

            <p>
              <a href="https://cloudinary.com?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=developerapi_logo">
                <CldImage
                  className="w-full max-w-xs"
                  src="assets/cloudinary-blue_mtkkjm"
                  width="468"
                  height="92"
                  alt="Cloudinary logo"
                  format="svg"
                  placeholder="empty"
                />
              </a>
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-12">How it Works</h2>

            <p>
              imgto.xyz uses <a href="https://cloudinary.com/?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=howitworks">Cloudinary&apos;s image and video API</a> to
              upload the image, optimize the image, then optionally convert it to a new format all with basic transformations.
            </p>

            <p>
              The API is the delivery URL, so after the image is uploaded, we can simply apply the `q_auto` transformation
              to optimize it:
            </p>

            <pre className="overflow-x-scroll bg-zinc-100 dark:bg-zinc-900">
              <code>{`https://res.cloudinary.com/<Cloud Name>/image/upload/q_auto/<Public ID>`}</code>
            </pre>

            <blockquote className="text-[.85em] border-l-4 border-l-blue-500">
              Note: imgto.xyz uses a heavier compression algorithm using <code className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded">{`q_auto:low`}</code>.
            </blockquote>

            <p>
              Converting the image to a new format is just as simple, using the <code className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded">{`f_<format>`}</code> transformation, such as:
            </p>

            <pre className="overflow-x-scroll bg-zinc-100 dark:bg-zinc-900">
              <code>{`https://res.cloudinary.com/<Cloud Name>/image/upload/f_avif/<Public ID>`}</code>
            </pre>

            <p>
              Learn more over on <a href="https://cloudinary.com/developers?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=howitworks">Cloudinary.com</a>!
            </p>
          </article>
        </Container>
      </Section>
    </div>
  )
}
