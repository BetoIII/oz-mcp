import { auth } from '@/app/auth';
import { prisma } from '@/app/prisma';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect('/');
  }

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null } // Include public clients the user created
      ]
    },
    include: {
      accessTokens: {
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      },
      authCodes: {
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const userTokens = await prisma.accessToken.findMany({
    where: { userId: session.user.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  async function createClient(formData: FormData) {
    'use server';
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const name = formData.get('name') as string;
    const redirectUris = formData.get('redirectUris') as string;
    
    if (!name || !redirectUris) {
      throw new Error('Missing required fields');
    }

    const redirectUriList = redirectUris.split('\n').map(uri => uri.trim()).filter(uri => uri);
    const clientSecret = randomBytes(32).toString('hex');

    await prisma.client.create({
      data: {
        name,
        redirectUris: redirectUriList,
        clientSecret,
        userId: session.user.id,
      },
    });

    redirect('/dashboard');
  }

  async function deleteClient(formData: FormData) {
    'use server';
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const clientId = formData.get('clientId') as string;
    
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session.user.id
      }
    });

    if (!client) {
      throw new Error('Client not found or unauthorized');
    }

    await prisma.client.delete({
      where: { id: clientId }
    });

    redirect('/dashboard');
  }

  async function revokeToken(formData: FormData) {
    'use server';
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const tokenId = formData.get('tokenId') as string;
    
    const token = await prisma.accessToken.findFirst({
      where: {
        id: tokenId,
        userId: session.user.id
      }
    });

    if (!token) {
      throw new Error('Token not found or unauthorized');
    }

    await prisma.accessToken.delete({
      where: { id: tokenId }
    });

    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OZ</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Developer Dashboard</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/playground" className="text-slate-600 hover:text-slate-900 transition-colors">
                Playground
              </Link>
              <Link href="/test" className="text-slate-600 hover:text-slate-900 transition-colors">
                Test
              </Link>
              <Link href="/docs/oauth-flow" className="text-slate-600 hover:text-slate-900 transition-colors">
                Docs
              </Link>
              <Link 
                href="/" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {session.user.image && (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  className="w-16 h-16 rounded-full border-2 border-blue-200"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Welcome, {session.user.name?.split(' ')[0]}!
                </h1>
                <p className="text-slate-600 mt-1">
                  Manage your OAuth clients and access tokens
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Clients</p>
              <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* OAuth Clients */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  OAuth Clients
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {clients.length} client{clients.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {clients.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No OAuth clients yet</h3>
                  <p className="text-slate-600 mb-6">
                    Create your first client to start using the API with OAuth 2.0 authentication.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-slate-600">
                      💡 OAuth clients allow your applications to securely access the MCP API on behalf of users.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {clients.map((client) => (
                    <div key={client.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 text-lg">{client.name}</h3>
                            <p className="text-sm text-slate-500">
                              Created {client.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {client.accessTokens.length} active
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            {client.authCodes.length} pending
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <p className="text-sm font-medium text-slate-700 mb-2">Client ID</p>
                          <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded break-all">
                            {client.clientId}
                          </code>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <p className="text-sm font-medium text-slate-700 mb-2">Client Secret</p>
                          <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {client.clientSecret.substring(0, 8)}...
                          </code>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Redirect URIs</p>
                        <div className="space-y-1">
                          {client.redirectUris.map((uri, index) => (
                            <div key={index} className="bg-white p-2 rounded-lg border border-slate-200">
                              <code className="text-xs font-mono text-slate-600">{uri}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex space-x-3">
                          <Link
                            href={`/oauth/authorize?client_id=${client.clientId}&redirect_uri=${encodeURIComponent(client.redirectUris[0])}&response_type=code&scope=api:read`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                          >
                            Test OAuth Flow
                          </Link>
                          <Link
                            href={`/playground`}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors font-medium"
                          >
                            Try API
                          </Link>
                        </div>
                        <form action={deleteClient} className="inline">
                          <input type="hidden" name="clientId" value={client.id} />
                          <button
                            type="submit"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"
                            onClick={(e) => {
                              if (!confirm('Are you sure you want to delete this client? This will revoke all associated tokens.')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Delete Client
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Create New Client */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Create New Client
              </h2>
              <form action={createClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Application"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Redirect URIs
                  </label>
                  <textarea
                    name="redirectUris"
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourapp.com/callback"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    One URI per line. Use HTTPS in production.
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Client
                </button>
              </form>
            </div>

            {/* Active Tokens */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Active Tokens
                </h2>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {userTokens.length} active
                </span>
              </div>
              
              {userTokens.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600">No active tokens</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTokens.slice(0, 5).map((token) => (
                    <div key={token.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">
                          {token.client.name}
                        </span>
                        <form action={revokeToken} className="inline">
                          <input type="hidden" name="tokenId" value={token.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            Revoke
                          </button>
                        </form>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Expires: {token.expiresAt.toLocaleString()}
                      </p>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <code className="text-xs font-mono text-slate-600">
                          {token.token.substring(0, 16)}...
                        </code>
                      </div>
                    </div>
                  ))}
                  
                  {userTokens.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500">
                        And {userTokens.length - 5} more tokens...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Links
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/docs/oauth-flow" 
                  className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">OAuth Guide</p>
                    <p className="text-xs text-slate-600">Learn OAuth 2.0 flow</p>
                  </div>
                </Link>
                
                <Link 
                  href="/playground" 
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">API Playground</p>
                    <p className="text-xs text-slate-600">Test API endpoints</p>
                  </div>
                </Link>
                
                <Link 
                  href="/test" 
                  className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Connection Test</p>
                    <p className="text-xs text-slate-600">Verify API connectivity</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}