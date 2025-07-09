import { auth } from '@/app/auth';
import { prisma } from '@/app/prisma';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic rendering since we use auth() and headers() which access request data
export const dynamic = 'force-dynamic';

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Request</h1>
            <p className="text-slate-600 mb-6">
              The authorization request is missing required parameters or contains invalid values.
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl mb-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Required Parameters:</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span><code className="bg-white px-2 py-1 rounded font-mono text-xs">client_id</code> - OAuth client identifier</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span><code className="bg-white px-2 py-1 rounded font-mono text-xs">redirect_uri</code> - Valid redirect URI</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span><code className="bg-white px-2 py-1 rounded font-mono text-xs">response_type</code> - Must be "code"</span>
              </li>
            </ul>
          </div>
          
          <a 
            href="/docs/oauth-flow" 
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Client</h1>
            <p className="text-slate-600 mb-6">
              The client ID is not recognized or the redirect URI is not registered for this client.
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl mb-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Common Issues:</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span>Client ID doesn't exist or is invalid</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span>Redirect URI is not registered with the client</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span>Client may have been deleted</span>
              </li>
            </ul>
          </div>
          
          <a 
            href="/dashboard" 
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Authorize Application
          </h1>
          <p className="text-slate-600">
            Review the permissions being requested
          </p>
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl mb-6 border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{client.name}</h3>
              <p className="text-sm text-slate-600">
                {client.user?.name ? `by ${client.user.name}` : 'Third-party application'}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Redirect URI:</span>
                <code className="text-slate-800 font-mono text-xs bg-slate-50 px-2 py-1 rounded">{redirectUri}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Client ID:</span>
                <code className="text-slate-800 font-mono text-xs bg-slate-50 px-2 py-1 rounded">{client.clientId}</code>
              </div>
              {scope && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Scope:</span>
                  <code className="text-slate-800 font-mono text-xs bg-slate-50 px-2 py-1 rounded">{scope}</code>
                </div>
              )}
              {state && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">State:</span>
                  <code className="text-slate-800 font-mono text-xs bg-slate-50 px-2 py-1 rounded">{state}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">This application will be able to:</h3>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-800">Access the Opportunity Zone MCP API</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-800">Check opportunity zone status for addresses/coordinates</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-800">Geocode addresses to coordinates</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-800">View service status and refresh data</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-900 mb-1">Security Notice</h4>
              <p className="text-sm text-amber-800">
                Only authorize applications you trust. You can revoke access at any time from your dashboard.
              </p>
            </div>
          </div>
        </div>

        <form action={handleConsent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="submit"
              name="consent"
              value="allow"
              size="lg"
              className="py-4 px-6"
            >
              Authorize
            </Button>
            <Button
              type="submit"
              name="consent"
              value="deny"
              variant="secondary"
              size="lg"
              className="py-4 px-6"
            >
              Deny
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            By authorizing, you agree to allow this application to access the MCP API on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
} 
