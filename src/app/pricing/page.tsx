import Section from '@/components/Section';
import Container from '@/components/Container';
import PageTitle from '@/components/PageTitle';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <article className="prose-xl">
            <PageTitle>Pricing</PageTitle>

            <p>
              imgto.xyz is absolutely <strong>free to use</strong>.
            </p>

            <p>
              This project is supported by Cloudinary. imgto.xyz
              uses <a href="https://cloudinary.com?utm_source=imgto.xyz&utm_medium=referral&utm_campaign=devx_imgtoxyz&utm_content=pricing_api">Cloudinary&apos;s image API</a> to
              optimize images and convert to modern formats.
            </p>

            <p>
              Learn more about <Link href="/developer-api">how it works</Link>!
            </p>
          </article>
        </Container>
      </Section>
    </div>
  )
}
