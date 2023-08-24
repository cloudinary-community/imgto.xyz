import Section from '@/components/Section';
import Container from '@/components/Container';
import PageTitle from '@/components/PageTitle';

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <article className="prose-xl">
            <PageTitle>Developer API</PageTitle>
            <p>
              Everything on imgto.xyz is built using <a href="https://cloudinary.com/">Cloudinary&apos;s</a> suite
              of <a href="https://cloudinary.com/developers">developer APIs</a>.
            </p>
            <p>
              By signing up for a free Cloudinary account, you can instantly gain access to the same APIs and
              more Cloudinary tech,
              including <a href="https://cloudinary.com/products/cloudinary_ai">AI tools</a> and <a href="https://cloudinary.com/solutions/video">video</a>.
            </p>
          </article>
        </Container>
      </Section>
    </div>
  )
}
