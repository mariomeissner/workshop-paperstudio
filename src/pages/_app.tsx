import { MantineProvider } from '@mantine/core';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { DefaultSeo } from 'next-seo';
import { type AppType } from 'next/app';
import Head from 'next/head';
import { GlobalContextProvider } from '~/context/GlobalContext';
import { api } from '~/utils/api';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <SessionProvider session={session}>
        <GlobalContextProvider>
          <Head>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <DefaultSeo
            title="PaperStudio - A supercharged research paper manager"
            description="The new best way to find and organize research papers. Add papers to your library in one click, get instant recommendations, and more."
            canonical="https://www.paperstudio.app"
            openGraph={{
              type: 'website',
              locale: 'en_US',
              url: 'https://www.paperstudio.app',
              siteName: 'PaperStudio',
            }}
            twitter={{
              handle: '@paperstudioapp',
              site: '@paperstudioapp',
              cardType: 'summary',
            }}
          />
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme: 'dark',
              primaryColor: 'violet',
              primaryShade: 7,
              defaultRadius: 'md',
              breakpoints: {
                xs: '30em',
                sm: '48em',
                md: '64em',
                lg: '74em',
                xl: '90em',
                '2xl': '108em',
                '3xl': '120em',
              },
              headings: {
                sizes: {
                  h1: {
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                  },
                  h2: {
                    fontSize: '2.0rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                  },
                  h3: {
                    fontSize: '1.5rem',
                  },
                  h4: {
                    fontSize: '1.25rem',
                  },
                  h5: {
                    fontSize: '1rem',
                  },
                  h6: {
                    fontSize: '0.875rem',
                  },
                },
              },
              globalStyles: (theme) => ({
                body: {
                  backgroundColor: theme.colors.dark[8],
                },
                mark: {
                  backgroundColor: theme.colors.violet[5] + ' !important', // TODO: Not sure why this is necessary
                  borderRadius: theme.radius.sm,
                },
              }),
              components: {
                ActionIcon: {
                  styles(theme, _params, _context) {
                    return {
                      root: {
                        '&:hover': {
                          backgroundColor: theme.colors.gray[8],
                        },
                      },
                    };
                  },
                },
                NavLink: {
                  defaultProps: {
                    color: 'violet',
                    variant: 'link',
                  },
                },
                Tooltip: {
                  defaultProps: {
                    withArrow: true,
                    multiline: true,
                    width: 300,
                  },
                },
                Checkbox: {
                  defaultProps: {
                    radius: 'sm',
                  },
                },
                Modal: {
                  defaultProps: {
                    padding: 'xl',
                  },
                  styles(_theme, _params, _context) {
                    return {
                      title: {
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      },
                    };
                  },
                },
              },
            }}
          >
            <Component {...pageProps} />
          </MantineProvider>
        </GlobalContextProvider>
      </SessionProvider>
      {/* Analytics removed for workshop */}
    </>
  );
};

export default api.withTRPC(MyApp);
