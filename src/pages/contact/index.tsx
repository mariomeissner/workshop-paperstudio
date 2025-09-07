import { Container } from '@mantine/core';
import { NextSeo } from 'next-seo';
import ContactForm from '~/components/contact-form';
import PageContainer from '~/components/page-container';

function ContactPage() {
  return (
    <>
      <NextSeo
        title="Contact | PaperStudio"
        description="Contact the PaperStudio team."
      />
      <PageContainer isOutside showLogo={true}>
        <Container>
          <ContactForm />
        </Container>
      </PageContainer>
    </>
  );
}

export default ContactPage;
