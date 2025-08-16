'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TeamMembersSkeleton() {
  return (
    <Card className="mb-4 sm:mb-6 lg:mb-8">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg lg:text-xl">Team Members</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="size-8 sm:size-10 rounded-full bg-gray-200"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded"></div>
              <div className="h-2 sm:h-3 w-12 sm:w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-4 sm:mb-6 lg:mb-8">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm sm:text-base">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 sm:mb-6 lg:mb-8">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg lg:text-xl">Team Members</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3 sm:space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <Avatar className="size-8 sm:size-10 lg:size-12 flex-shrink-0">
                  {/* 
                    This app doesn't save profile images, but here
                    is how you'd show them:

                    <AvatarImage
                      src={member.user.image || ''}
                      alt={getUserDisplayName(member.user)}
                    />
                  */}
                  <AvatarFallback className="text-xs sm:text-sm">
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction} className="flex-shrink-0">
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-red-500 mt-3 sm:mt-4 text-sm">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg lg:text-xl">Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg lg:text-xl">Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={inviteAction} className="space-y-4 sm:space-y-5">
          <div>
            <Label htmlFor="email" className="text-sm sm:text-base font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              required
              disabled={!isOwner}
              className="mt-1.5 sm:mt-2 text-sm sm:text-base h-9 sm:h-10"
            />
          </div>
          <div>
            <Label className="text-sm sm:text-base font-medium">Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2 sm:mt-3"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" className="text-sm" />
                <Label htmlFor="member" className="text-sm sm:text-base cursor-pointer">Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owner" id="owner" className="text-sm" />
                <Label htmlFor="owner" className="text-sm sm:text-base cursor-pointer">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{inviteState.error}</p>
            </div>
          )}
          {inviteState?.success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200">
              <p className="text-green-600 text-sm">{inviteState.success}</p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white h-9 sm:h-10 text-sm sm:text-base"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter className="pt-3 sm:pt-4">
          <div className="p-3 rounded-md bg-gray-50 border border-gray-200 w-full">
            <p className="text-xs sm:text-sm text-muted-foreground">
              You must be a team owner to invite new members.
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Team Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Manage your team members and invite new collaborators
        </p>
      </div>
      
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <Suspense fallback={<TeamMembersSkeleton />}>
          <TeamMembers />
        </Suspense>
        <Suspense fallback={<InviteTeamMemberSkeleton />}>
          <InviteTeamMember />
        </Suspense>
      </div>
    </section>
  );
}
