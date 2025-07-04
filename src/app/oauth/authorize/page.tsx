import { auth } from '@/app/auth';
import { prisma } from '@/app/prisma';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';
import { headers } from 'next/headers';

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const params = await searchParams;

  const clientId = params.client_id as string;
  const redirectUri = params.redirect_uri as string;
  const responseType = params.response_type as string;
  const state = params.state as string;
  const scope = params.scope as string;
  const code_challenge = params.code_challenge as string | undefined;
  const code_challenge_method = params.code_challenge_method as string | undefined;

  if (!session || !session.user || !session.user.id) {
    const headersList = await headers();
    const host = headersList.get('host');
    const prot = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${prot}://${host}`;

    const loginUrl = new URL('/api/auth/signin', baseUrl);
    const callbackUrl = new URL('/oauth/authorize', baseUrl);

    // Add all current search params to the callback URL
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        callbackUrl.searchParams.set(key, value);
      }
    });

    loginUrl.searchParams.set('callbackUrl', callbackUrl.toString());
    return redirect(loginUrl.toString());
  }

  if (!clientId || !redirectUri || responseType !== 'code') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
          <p className="text-gray-600 mb-6">
            The authorization request is missing required parameters or contains invalid values.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Required Parameters:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-white px-1 rounded">client_id</code> - OAuth client identifier</li>
              <li>• <code className="bg-white px-1 rounded">redirect_uri</code> - Valid redirect URI</li>
              <li>• <code className="bg-white px-1 rounded">response_type</code> - Must be "code"</li>
            </ul>
          </div>
          <a 
            href="/docs/oauth-flow" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    );
  }

  const client = await prisma.client.findUnique({
    where: { clientId },
    include: {
      user: true,
      _count: {
        select: {
          accessTokens: true,
          authCodes: true
        }
      }
    }
  });

  if (!client || !client.redirectUris.includes(redirectUri)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Client</h1>
          <p className="text-gray-600 mb-6">
            The client ID is not recognized or the redirect URI is not registered for this client.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Common Issues:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Client ID doesn't exist or is invalid</li>
              <li>• Redirect URI is not registered with the client</li>
              <li>• Client may have been deleted</li>
            </ul>
          </div>
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  async function handleConsent(formData: FormData) {
    'use server';

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('No session found during consent handling.');
    }

    if (!client) throw new Error('Client not found during consent handling.');

    const consent = formData.get('consent');
    const redirectUrl = new URL(redirectUri);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    if (consent === 'deny') {
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'User denied authorization');
      return redirect(redirectUrl.toString());
    }

    const authorizationCode = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.authCode.create({
      data: {
        code: authorizationCode,
        expiresAt,
        clientId: client.id,
        userId: session.user.id,
        redirectUri: redirectUri,
        codeChallenge: code_challenge,
        codeChallengeMethod: code_challenge_method,
      },
    });

    redirectUrl.searchParams.set('code', authorizationCode);
    redirect(redirectUrl.toString());
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-blue-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authorize Application
          </h1>
          <p className="text-gray-600">
            Review the permissions being requested
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-600">
                {client.user?.name ? `by ${client.user.name}` : 'Third-party application'}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Redirect URI:</strong> {redirectUri}</p>
            <p><strong>Client ID:</strong> <code className="bg-white px-1 rounded">{client.clientId}</code></p>
            {scope && <p><strong>Requested Scope:</strong> <code className="bg-white px-1 rounded">{scope}</code></p>}
            {state && <p><strong>State:</strong> <code className="bg-white px-1 rounded">{state}</code></p>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">This application will be able to:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Access the Opportunity Zone MCP API
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Check opportunity zone status for addresses/coordinates
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Geocode addresses to coordinates
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              View service status and refresh data
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Security Notice</span>
          </div>
          <p className="text-sm text-yellow-700">
            Only authorize applications you trust. You can revoke access at any time from your dashboard.
          </p>
        </div>

        <form action={handleConsent} className="space-y-4">
          <div className="flex space-x-4">
            <button
              type="submit"
              name="consent"
              value="allow"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Authorize
            </button>
            <button
              type="submit"
              name="consent"
              value="deny"
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
            >
              Deny
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By authorizing, you agree to allow this application to access the MCP API on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
} 
