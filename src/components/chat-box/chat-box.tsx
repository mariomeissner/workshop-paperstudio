import { useChat } from '@ai-sdk/react';
import {
  Anchor,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconInfoCircle, IconRobot, IconUser } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type Props = {
  disabled: boolean;
  arxivId: string;
  paperTitle: string;
  paperAbstract: string;
};

function ChatBox({ disabled, arxivId, paperTitle, paperAbstract }: Props) {
  const { data: session } = useSession();

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: '/api/chat',
      body: {
        arxivId,
        title: paperTitle,
        abstract: paperAbstract,
      },
      initialMessages: [
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "I'm your research assistant! Ask me anything about this paper.",
        },
      ],
    });

  function ChatEntry(props: {
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string | React.ReactElement;
  }) {
    // Only render user and assistant messages visually
    if (props.role !== 'user' && props.role !== 'assistant') {
      return null;
    }

    return (
      <Paper px="1rem" py="0.8rem" radius="md">
        <Flex
          direction={props.role === 'assistant' ? 'row-reverse' : 'row'}
          align="flex-start"
          gap="md"
        >
          <Avatar
            radius="xl"
            src={props.role === 'user' ? session?.user.image : undefined}
          >
            {props.role === 'assistant' ? (
              <IconRobot size="1.2rem" />
            ) : (
              <IconUser size="1.2rem" />
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {typeof props.content === 'string' ? (
              <Markdown
                components={{
                  code(props) {
                    const { children, className, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        PreTag="div"
                        language={match[1]}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        {...rest}
                        className={className}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <Text component="p" mb="sm" lh={1.6}>
                      {children}
                    </Text>
                  ),
                  ul: ({ children }) => (
                    <Box component="ul" pl="md" mb="sm">
                      {children}
                    </Box>
                  ),
                  ol: ({ children }) => (
                    <Box component="ol" pl="md" mb="sm">
                      {children}
                    </Box>
                  ),
                  li: ({ children }) => (
                    <Text component="li" mb="xs" lh={1.6}>
                      {children}
                    </Text>
                  ),
                  h1: ({ children }) => (
                    <Title order={1} mb="sm" mt="lg">
                      {children}
                    </Title>
                  ),
                  h2: ({ children }) => (
                    <Title order={2} mb="sm" mt="lg">
                      {children}
                    </Title>
                  ),
                  h3: ({ children }) => (
                    <Title order={3} mb="sm" mt="md">
                      {children}
                    </Title>
                  ),
                  h4: ({ children }) => (
                    <Title order={4} mb="sm" mt="md">
                      {children}
                    </Title>
                  ),
                  h5: ({ children }) => (
                    <Title order={5} mb="sm" mt="md">
                      {children}
                    </Title>
                  ),
                  h6: ({ children }) => (
                    <Title order={6} mb="sm" mt="md">
                      {children}
                    </Title>
                  ),
                  blockquote: ({ children }) => (
                    <Box
                      component="blockquote"
                      sx={(theme) => ({
                        borderLeft: `4px solid ${theme.colors.violet[6]}`,
                        paddingLeft: theme.spacing.md,
                        margin: `${theme.spacing.sm} 0`,
                        fontStyle: 'italic',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: theme.radius.sm,
                        padding: theme.spacing.sm,
                      })}
                    >
                      {children}
                    </Box>
                  ),
                  a: ({ href, children }) => (
                    <Anchor
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </Anchor>
                  ),
                  strong: ({ children }) => (
                    <Text component="strong" weight={700}>
                      {children}
                    </Text>
                  ),
                  em: ({ children }) => (
                    <Text component="em" italic>
                      {children}
                    </Text>
                  ),
                }}
              >
                {props.content}
              </Markdown>
            ) : (
              props.content
            )}
          </Box>
        </Flex>
      </Paper>
    );
  }

  if (disabled) {
    return (
      <Box>
        <Group position="left" align="center" spacing="xs">
          <Title order={4}> PaperStudio AI Chat </Title>
          <Tooltip
            label="Chat functionality leverages an LLM with access to the full-text
                  content of the paper. Content is read from the arXiv. All
                  copyright and intellectual property rights belong to the
                  original authors."
          >
            <IconInfoCircle size="1.2rem" />
          </Tooltip>
        </Group>
        <Stack mt="1rem">
          <ChatEntry
            role="assistant"
            content={
              <Text>
                Hi! I am PaperStudio AI Chat.{' '}
                <Anchor component={Link} href={'/signin'}>
                  Sign in
                </Anchor>{' '}
                to ask me questions about this paper!
              </Text>
            }
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Group position="left" align="center" spacing="xs">
        <Title order={4}> PaperStudio AI Chat </Title>
        <Tooltip
          label="Chat functionality leverages an LLM with access to the full-text
                content of the paper. Content is read from the arXiv. All
                copyright and intellectual property rights belong to the
                original authors."
        >
          <IconInfoCircle size="1.2rem" />
        </Tooltip>
      </Group>
      <Stack mt="1rem">
        <Stack>
          {messages.map((message) => (
            <ChatEntry
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          {error && (
            <ChatEntry
              role="assistant"
              content={`Error: ${
                error.message ||
                'An unexpected error occurred. Please try again.'
              }`}
            />
          )}
        </Stack>
        {isLoading && <ChatEntry role="assistant" content="I'm thinking..." />}
        <Tooltip
          label="Ask me anything about this paper!"
          disabled={disabled}
          width="auto"
        >
          <form onSubmit={handleSubmit}>
            <Group>
              <Textarea
                autosize
                value={input}
                onChange={handleInputChange}
                placeholder="Type here"
                disabled={disabled || isLoading}
                sx={{
                  flexGrow: 1,
                }}
                onKeyUp={(event: React.KeyboardEvent<HTMLTextAreaElement>) =>
                  event.key === 'Enter' &&
                  !isLoading &&
                  !disabled &&
                  handleSubmit(event)
                }
              />
              <Button
                type="submit"
                loading={isLoading}
                disabled={disabled || !input.trim()}
                sx={{
                  flexGrow: 0,
                }}
              >
                Send
              </Button>
            </Group>
          </form>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default ChatBox;
