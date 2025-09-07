import { Button, Stack, TextInput, Textarea, Title } from '@mantine/core';

function ContactForm() {
  return (
    <Stack mt="2rem" maw="40rem">
      <Title order={2} mt={10}>
        Contact
      </Title>
      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <TextInput
          type="email"
          label="Your email"
          name="email"
          id="email"
          placeholder="your-email@domain.com"
          required
        />
        <Textarea
          mt="0.5rem"
          id="message"
          name="message"
          label="Your message"
          placeholder="Leave a comment..."
          autosize
          minRows={2}
          required
        />
        <Button mt="1rem" type="submit">
          Send message
        </Button>
      </form>
    </Stack>
  );
}

export default ContactForm;
