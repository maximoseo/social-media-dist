import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/social/guards';
import { workspaceCreateSchema } from '@/lib/social/schemas';
import { createWorkspaceForUser } from '@/lib/social/repository';
import { assertRateLimit } from '@/lib/social/rate-limit';

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    assertRateLimit(`workspace:${user.id}`, 5, 60_000);
    const payload = workspaceCreateSchema.parse(await request.json());
    const site = await createWorkspaceForUser(user.id, payload);
    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create workspace.';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}
