import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };

  if (
    typeof userId !== 'string'
    || typeof teamId !== 'string'
    || typeof type !== 'string'
    || !type.trim()
    || typeof minutes !== 'number'
    || !Number.isFinite(minutes)
    || minutes <= 0
  ) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw Object.assign(new Error('Invalid activity reference'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity references were not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  const { name, mascot, members } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };

  if (
    typeof name !== 'string'
    || !name.trim()
    || typeof mascot !== 'string'
    || !mascot.trim()
  ) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  if (members !== undefined && (!Array.isArray(members) || members.some((member) => typeof member !== 'string'))) {
    throw Object.assign(new Error('Invalid team members'), { status: 400 });
  }

  const memberIds = (members as string[] | undefined) ?? [];
  if (memberIds.some((memberId) => !mongoose.isValidObjectId(memberId))) {
    throw Object.assign(new Error('Invalid team member reference'), { status: 400 });
  }

  const existingMembers = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
  if (existingMembers.length !== memberIds.length) {
    throw Object.assign(new Error('Team member references were not found'), { status: 404 });
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: existingMembers.map((member) => member._id),
  });

  await User.updateMany(
    { _id: { $in: existingMembers.map((member) => member._id) } },
    { $set: { team: team._id } },
  );

  return team;
}

export async function getLeaderboard() {
  const entries = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
  ]);

  return entries.map((entry, index) => ({
    teamName: entry.team.name,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = userEmail.trim();
  if (!email) {
    throw Object.assign(new Error('Invalid user email'), { status: 400 });
  }

  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const activities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();

  const types = activities.map((activity) => activity.type.toLowerCase());
  let focus = user.fitnessGoal?.toLowerCase() || '';

  if (types.includes('strength')) {
    focus = 'strength';
  } else if (types.includes('run') || types.includes('cycle') || types.includes('walk')) {
    focus = 'endurance';
  }

  if (!focus) {
    return [];
  }

  const workout = await Workout.findOne({ focus }).lean();
  if (!workout) {
    return [];
  }

  const activityDescription = types.length > 0
    ? `Based on your ${types[0]} activity`
    : `Based on your ${focus} fitness goal`;

  return [{
    ...workout,
    reason: `${activityDescription} and ${focus} focus`,
  }];
}

export { User };
