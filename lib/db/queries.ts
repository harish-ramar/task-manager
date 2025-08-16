import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  activityLogs, 
  teamMembers, 
  teams, 
  users, 
  tasks, 
  taskMedia, 
  taskComments,
  NewTask,
  NewTaskComment,
  NewTaskMedia,
  TaskStatus
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  try {
    const sessionCookie = (await cookies()).get('session');
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// Task-related queries
export async function getTasks() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db.query.tasks.findMany({
    orderBy: desc(tasks.createdAt),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true
        }
      },
      media: {
        with: {
          uploadedBy: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      },
      comments: {
        orderBy: desc(taskComments.createdAt),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function getTaskById(taskId: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true
        }
      },
      media: {
        with: {
          uploadedBy: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      },
      comments: {
        orderBy: desc(taskComments.createdAt),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function createTask(taskData: Omit<NewTask, 'createdBy'>) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [newTask] = await db.insert(tasks).values({
    ...taskData,
    createdBy: user.id
  }).returning();

  return newTask;
}

export async function updateTask(taskId: number, updates: Partial<Pick<NewTask, 'title' | 'description' | 'status'>>) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [updatedTask] = await db.update(tasks)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return updatedTask;
}

export async function deleteTask(taskId: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  await db.delete(tasks).where(eq(tasks.id, taskId));
}

export async function addTaskComment(taskId: number, comment: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [newComment] = await db.insert(taskComments).values({
    taskId,
    comment,
    createdBy: user.id
  }).returning();

  return newComment;
}

export async function addTaskMedia(taskId: number, mediaData: Omit<NewTaskMedia, 'taskId' | 'uploadedBy'>) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [newMedia] = await db.insert(taskMedia).values({
    ...mediaData,
    taskId,
    uploadedBy: user.id
  }).returning();

  return newMedia;
}

export async function deleteTaskMedia(mediaId: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  await db.delete(taskMedia).where(eq(taskMedia.id, mediaId));
}
