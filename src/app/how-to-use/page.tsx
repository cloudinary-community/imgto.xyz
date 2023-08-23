import Section from '@/components/Section';
import Container from '@/components/Container';
import PageTitle from '@/components/PageTitle';

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <article className="prose-xl">
            <PageTitle>How to Use</PageTitle>
            <p>
              imgto.xyz is a tool that allows you to quickly and easily optimize your images for web and mobile devices.
            </p>
            <p>
              To get started, upload your file on the homepage whether selecting the file from your local filesystem or dragging it directly into the application.
            </p>
          </article>
        </Container>
      </Section>
    </div>
  )
}
