import { Container, Text, Title } from '@mantine/core';
import ContactForm from '~/components/contact-form';
import PageContainer from '~/components/page-container';

function AboutPage() {
  return (
    <PageContainer isOutside showLogo={true}>
      <Container>
        <Title order={1}>About</Title>
        <Text>
          Reference managers have been stuck in the past for too long. We are
          building a tool that is fast, intuitive, and beautiful. A research
          paper manager that you will love to use, packed with useful features.
          Our long-term mission is to provide an all-encopassing research
          platform that will help you with every step of your research journey,
          without ever leaving the app.
        </Text>
        <Text mt="1rem">
          We are a small team of passionate developers and researchers, and we
          are working hard to make this a reality. If you want to help us,
          consider subscribing, or send us a message!
        </Text>

        <ContactForm />
      </Container>
    </PageContainer>
  );
}

export default AboutPage;
