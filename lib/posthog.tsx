import { useUser } from '@clerk/expo'
import { PostHogProvider, usePostHog } from 'posthog-react-native'
import { type ReactNode, useEffect, useRef } from 'react'


const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST

interface PostHogAppProviderProps {
  children: ReactNode
}

function PostHogIdentity({ children }: PostHogAppProviderProps) {
  const { user } = useUser()
  const posthog = usePostHog()
  const identifiedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      if (identifiedUserId.current) {
        posthog.reset()
        identifiedUserId.current = null
      }
      return
    }

    if (identifiedUserId.current === user.id) {
      return
    }

    if (identifiedUserId.current) {
      posthog.reset()
    }

    const personProperties: Record<string, string> = {}
    const email = user.primaryEmailAddress?.emailAddress

    if (email) {
      personProperties.email = email
    }

    if (user.fullName) {
      personProperties.name = user.fullName
    }

    posthog.identify(user.id, {
      $set: personProperties,
    })
    identifiedUserId.current = user.id
  }, [posthog, user])

  return children
}

export function PostHogAppProvider({ children }: PostHogAppProviderProps) {
  if (!projectToken || !host) {
    if (__DEV__) {
      const missingVariable = !projectToken
        ? 'POSTHOG_PROJECT_TOKEN'
        : 'POSTHOG_HOST'

      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      )
    }

    return children
  }

  return (
    <PostHogProvider
      apiKey={projectToken}
      options={{
        host,
        logs: {
          serviceName: 'recurly-mobile',
          environment: __DEV__ ? 'development' : 'production',
        },
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
          },
        },
      }}
    >
      <PostHogIdentity>{children}</PostHogIdentity>
    </PostHogProvider>
  )
}
