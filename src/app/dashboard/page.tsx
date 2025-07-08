import { requireAuth, DatabaseConnectionError } from '@/lib/auth-utils';
import { prisma } from '@/app/prisma';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';
import Link from 'next/link';
import DeleteClientButton from './components/DeleteClientButton';
import { DatabaseError } from '@/components/DatabaseError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Copy, ExternalLink, Key, Trash2, User, Shield, Clock, Database, Plus } from 'lucide-react';
import { config } from '@/lib/utils';
import { Footer } from "@/components/Footer"
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  let session;
  
  try {
    session = await requireAuth();
  } catch (error) {
    if (error instanceof DatabaseConnectionError) {
      return <DatabaseError message={error.message} />;
    }
    // Other errors will be handled by requireAuth (redirects, etc.)
    throw error;
  }

  const clients = await prisma.client.findMany({
    where: {
      userId: session.user!.id
    },
    include: {
      accessTokens: {
        where: { userId: session.user!.id },
        orderBy: { createdAt: 'desc' }
      },
      authCodes: {
        where: { userId: session.user!.id },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const userTokens = await prisma.accessToken.findMany({
    where: { userId: session.user!.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  async function createClient(formData: FormData) {
    'use server';
    
    const session = await requireAuth();
    
    const name = formData.get('name') as string;
    
    if (!name) {
      throw new Error('Missing required fields');
    }

    // Use default callback URLs for the OAuth flow
    const defaultRedirectUris = [
      `${process.env.NEXTAUTH_URL || 'https://oz-mcp.vercel.app'}/oauth/callback`,
      'http://localhost:3000/callback'
    ];
    
    const clientSecret = randomBytes(32).toString('hex');

    await prisma.client.create({
      data: {
        name,
        redirectUris: defaultRedirectUris,
        clientSecret,
        userId: session.user!.id,
      },
    });

    redirect('/dashboard');
  }

  async function deleteClient(formData: FormData) {
    'use server';
    
    const session = await requireAuth();

    const clientId = formData.get('clientId') as string;
    
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session.user!.id
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

  async function createApiKey(formData: FormData) {
    'use server';
    
    const session = await requireAuth();
    const clientId = formData.get('clientId') as string;
    
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session.user!.id
      }
    });

    if (!client) {
      throw new Error('Client not found or unauthorized');
    }

    // Redirect to OAuth authorization flow for API key creation
    const authUrl = new URL('/oauth/authorize', config.baseUrl);
    authUrl.searchParams.set('client_id', client.clientId);
    authUrl.searchParams.set('redirect_uri', client.redirectUris[0]); // Use first registered redirect URI
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', randomBytes(16).toString('hex')); // CSRF protection

    redirect(authUrl.toString());
  }

  async function deleteApiKey(formData: FormData) {
    'use server';
    
    const session = await requireAuth();
    const tokenId = formData.get('tokenId') as string;
    
    const token = await prisma.accessToken.findFirst({
      where: {
        id: tokenId,
        userId: session.user!.id
      }
    });

    if (!token) {
      throw new Error('API key not found or unauthorized');
    }

    await prisma.accessToken.delete({
      where: { id: tokenId }
    });

    redirect('/dashboard');
  }

  async function revokeToken(formData: FormData) {
    'use server';
    
    const session = await requireAuth();

    const tokenId = formData.get('tokenId') as string;
    
    const token = await prisma.accessToken.findFirst({
      where: {
        id: tokenId,
        userId: session.user!.id
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

  // Determine the callback URL based on environment
  const callbackUrl = `${config.baseUrl}/oauth/callback`;

  return (
    <DashboardClient>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <UserAvatar
                  src={session.user!.image}
                  name={session.user!.name}
                  alt={session.user!.name || "User"}
                  className="w-16 h-16 border-2 border-blue-200"
                />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Welcome, {session.user!.name?.split(' ')[0]}!
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
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* OAuth Clients */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>OAuth Clients</span>
                </CardTitle>
                <CardDescription>
                  Create and manage OAuth 2.0 applications that can access the MCP server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create Client Form */}
                <form action={createClient} className="space-y-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900">Create New Client</h4>
                  <div className="space-y-2">
                    <Label htmlFor="name">Application Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="My Application"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Client
                  </Button>
                </form>

                <Separator />

                {/* Existing Clients */}
                <div className="space-y-4">
                  {clients.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No OAuth clients yet</p>
                      <p className="text-sm text-slate-400">Create your first client above</p>
                    </div>
                  ) : (
                    clients.map((client) => (
                      <Card key={client.id} className="border border-slate-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{client.name}</CardTitle>
                            <Badge variant="secondary">
                              {client.accessTokens.length} API key{client.accessTokens.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-slate-500">CLIENT ID</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 font-mono">
                                  {client.id}
                                </code>
                                <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">CLIENT SECRET</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 font-mono">
                                  {'•'.repeat(20)}
                                </code>
                                <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* API Keys Section */}
                          <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium text-slate-700">API Keys</Label>
                              <form action={createApiKey}>
                                <input type="hidden" name="clientId" value={client.id} />
                                <Button size="sm" variant="outline" className="h-8">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create API Key
                                </Button>
                              </form>
                            </div>
                            
                            {client.accessTokens.length === 0 ? (
                              <div className="text-center py-4 bg-slate-50 rounded-lg">
                                <Key className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No API keys created</p>
                                <p className="text-xs text-slate-400">Create your first API key above</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {client.accessTokens.map((token) => (
                                  <div key={token.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <code className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">
                                          {token.token.substring(0, 8)}...{token.token.substring(token.token.length - 8)}
                                        </code>
                                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-1">
                                        Created {new Date(token.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <form action={deleteApiKey}>
                                      <input type="hidden" name="tokenId" value={token.id} />
                                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </form>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span>Created {new Date(client.createdAt).toLocaleDateString()}</span>
                            </div>
                            <DeleteClientButton 
                              clientId={client.id}
                              clientName={client.name}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    src={session.user!.image}
                    name={session.user!.name}
                    alt={session.user!.name || "User"}
                    className="w-10 h-10"
                  />
                  <div>
                    <p className="font-medium">{session.user!.name}</p>
                    <p className="text-sm text-slate-600">{session.user!.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Tokens Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Key Summary</span>
                </CardTitle>
                <CardDescription>
                  Total active API keys across all clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userTokens.length === 0 ? (
                  <div className="text-center py-4">
                    <Key className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No active API keys</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{userTokens.length}</p>
                      <p className="text-sm text-slate-500">Total API Keys</p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        userTokens.reduce((acc, token) => {
                          acc[token.client.name] = (acc[token.client.name] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([clientName, count]) => (
                        <div key={clientName} className="flex justify-between text-sm">
                          <span className="text-slate-600">{clientName}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/playground">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Playground
                  </Button>
                </Link>
                <Link href="/docs/oauth-flow">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    OAuth Documentation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </DashboardClient>
  );
}