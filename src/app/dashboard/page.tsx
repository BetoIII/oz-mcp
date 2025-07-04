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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your OAuth clients and access tokens
              </p>
            </div>
            <Link 
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* OAuth Clients */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                OAuth Clients
              </h2>
              
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    You haven't created any OAuth clients yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Create your first client to start using the API.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <span className="text-xs text-gray-500">
                          Created {client.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Client ID:</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all">
                            {client.clientId}
                          </code>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Client Secret:</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {client.clientSecret.substring(0, 8)}...
                          </code>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-gray-600 mb-1">Redirect URIs:</p>
                        <div className="space-y-1">
                          {client.redirectUris.map((uri, index) => (
                            <code key={index} className="block bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {uri}
                            </code>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            {client.accessTokens.length} active tokens
                          </span>
                          <span>
                            {client.authCodes.length} pending codes
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/oauth/authorize?client_id=${client.clientId}&redirect_uri=${encodeURIComponent(client.redirectUris[0])}&response_type=code&scope=api:read`}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Test OAuth
                          </Link>
                          <form action={deleteClient} className="inline">
                            <input type="hidden" name="clientId" value={client.id} />
                            <button
                              type="submit"
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                              onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this client? This will revoke all associated tokens.')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Delete
                            </button>
                          </form>
                        </div>
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Client
              </h2>
              <form action={createClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My App"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Redirect URIs
                  </label>
                  <textarea
                    name="redirectUris"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourapp.com/callback"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    One URI per line
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Client
                </button>
              </form>
            </div>

            {/* Active Tokens */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Tokens
              </h2>
              
              {userTokens.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No active tokens
                </p>
              ) : (
                <div className="space-y-3">
                  {userTokens.slice(0, 5).map((token) => (
                    <div key={token.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {token.client.name}
                        </span>
                        <form action={revokeToken} className="inline">
                          <input type="hidden" name="tokenId" value={token.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Revoke
                          </button>
                        </form>
                      </div>
                      <p className="text-xs text-gray-500">
                        Expires: {token.expiresAt.toLocaleString()}
                      </p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {token.token.substring(0, 12)}...
                      </code>
                    </div>
                  ))}
                  
                  {userTokens.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      And {userTokens.length - 5} more...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link href="/docs/getting-started" className="block text-blue-600 hover:underline text-sm">
                  📚 Getting Started Guide
                </Link>
                <Link href="/docs/oauth-flow" className="block text-blue-600 hover:underline text-sm">
                  🔐 OAuth Flow Documentation
                </Link>
                <Link href="/playground" className="block text-blue-600 hover:underline text-sm">
                  🧪 API Playground
                </Link>
                <Link href="/test" className="block text-blue-600 hover:underline text-sm">
                  🔧 Connection Test
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}