'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Textarea } from '@repo/ui/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';

export default function DemoPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // tRPC queries and mutations with full type safety
  const { data: posts, isLoading, refetch } = trpc.post.getAll.useQuery();
  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      refetch();
      setTitle('');
      setContent('');
    },
  });
  const deletePost = trpc.post.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      createPost.mutate({ title, content });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">tRPC Demo</h1>
        <p className="text-muted-foreground">
          Full-stack type-safe API with tRPC, Drizzle ORM, and PostgreSQL
        </p>
      </div>

      {/* Create Post Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Add a new post using tRPC mutation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium mb-2"
              >
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content"
                rows={4}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createPost.isPending || !title || !content}
            >
              {createPost.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            Fetched using tRPC query with automatic refetch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading posts...</p>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-muted-foreground mt-1">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost.mutate({ id: post.id })}
                      disabled={deletePost.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No posts yet. Create your first post above!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>✅ Full Type Safety:</strong> Types flow from database schema
            → tRPC router → React components
          </p>
          <p>
            <strong>✅ Automatic Validation:</strong> Zod schemas validate inputs
            on both client and server
          </p>
          <p>
            <strong>✅ React Query Integration:</strong> Automatic caching,
            refetching, and loading states
          </p>
          <p>
            <strong>✅ Database:</strong> PostgreSQL with Drizzle ORM for type-safe
            queries
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
