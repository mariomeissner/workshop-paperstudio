import { Box, Button, Flex, Text } from '@mantine/core';
import Link from 'next/link';

const links = [
  {
    label: 'About',
    link: '/about',
  },
  {
    label: 'Contact',
    link: '/contact',
  },
];

function Footer() {
  return (
    <Box pt="5rem" pb="1rem">
      <Flex
        direction="row"
        justify={{ base: 'center', md: 'right' }}
        align="center"
        rowGap={0}
        wrap="wrap"
        columnGap={0}
      >
        {links.map((link) => (
          <Button
            px="0.6rem"
            variant="link"
            key={link.label}
            component={Link}
            href={link.link}
          >
            {link.label}
          </Button>
        ))}
        <Text mx="md" size={'sm'}>
          © 2025 Paper Studio™. All Rights Reserved.
        </Text>
      </Flex>
    </Box>
  );
}

export default Footer;
