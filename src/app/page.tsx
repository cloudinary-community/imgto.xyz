import Section from '@/components/Section';
import Container from '@/components/Container';
import WidgetUpload from '@/components/WidgetUpload';

export default function Home() {
  return (
    <div className="mt-4 md:mt-14">
      <Section>
        <Container>
          <WidgetUpload className="mb-12 md:mb-20" />
          <h1 className="text-5xl font-black text-center mb-6">
            Optimize Your Images for Free
          </h1>
          <p className="text-xl text-center">
            Easily optimize and compress your images to help improve performance. All free!
          </p>
        </Container>
      </Section>
    </div>
  )
}
