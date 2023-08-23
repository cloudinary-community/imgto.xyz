import Section from '@/components/Section';
import Container from '@/components/Container';
import PageTitle from '@/components/PageTitle';

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <article className="prose-xl">
            <PageTitle>Pricing</PageTitle>
            <p>
              imgto.xyz for now is absolutely free to use!
            </p>
          </article>
        </Container>
      </Section>
    </div>
  )
}
